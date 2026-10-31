import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// kjornesodden.vercel.app viser samme innhold som kjornesodden.no. Send sidevisninger
// dit med 301 så Google bare ser én adresse. /api/ unntas, så eldre klienter som poster
// bestillinger til vercel-adressen fortsatt virker.
const DUPLICATE_HOST = "kjornesodden.vercel.app";
const PRIMARY_ORIGIN = "https://www.kjornesodden.no";

function duplicateHostRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host)
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (host !== DUPLICATE_HOST) return undefined;
  if (url.pathname.startsWith("/api/")) return undefined;
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  return new Response(null, {
    status: 301,
    headers: { location: `${PRIMARY_ORIGIN}${url.pathname}${url.search}` },
  });
}

// Umami-telling via egen adresse, så annonseblokkere ikke stopper den (docs.umami.is/docs/bypass-ad-blockers).
// /k/s.js er skriptet, /k/api/send tar imot tellingen og sender den videre med besøkendes IP,
// ellers ville alle besøkende sett ut som én.
const STATS_SCRIPT = "https://cloud.umami.is/script.js";
const STATS_SEND = "https://gateway.umami.is/api/send";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "";
}

// Umami Cloud ligger bak Cloudflare og ser ellers Vercels IP. Feltet payload.ip gir Umami
// besøkendes egen IP, så hver besøkende telles for seg og stedet blir riktig.
function withClientIp(body: string, ip: string): string {
  if (!ip) return body;
  try {
    const data = JSON.parse(body) as { payload?: Record<string, unknown> };
    if (data && typeof data.payload === "object" && data.payload && !data.payload.ip) {
      data.payload.ip = ip;
      return JSON.stringify(data);
    }
  } catch {
    // Ikke JSON: send uendret.
  }
  return body;
}

async function statsProxy(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (url.pathname === "/k/s.js" && request.method === "GET") {
    const upstream = await fetch(STATS_SCRIPT);
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }
  if (url.pathname === "/k/api/send" && request.method === "POST") {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "user-agent": request.headers.get("user-agent") ?? "",
    };
    const ip = clientIp(request);
    if (ip) headers["x-forwarded-for"] = ip;
    const cache = request.headers.get("x-umami-cache");
    if (cache) headers["x-umami-cache"] = cache;
    const body = await request.text();
    const upstream = await fetch(STATS_SEND, { method: "POST", headers, body: withClientIp(body, ip) });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  }
  return undefined;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const redirect = duplicateHostRedirect(request);
    if (redirect) return redirect;
    try {
      const stats = await statsProxy(request);
      if (stats) return stats;
    } catch (error) {
      console.error(error);
      return new Response(null, { status: 204 });
    }
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
