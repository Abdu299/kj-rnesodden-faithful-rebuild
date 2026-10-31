// Umami Cloud (cookiefri telling). Kontoen eies av Onlinemarkedsføring.no.
export const UMAMI_WEBSITE_ID = "21a957ff-256c-4322-9e50-3670134ce46a";

type UmamiData = Record<string, string | number>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: UmamiData) => void };
  }
}

const sent = new Set<string>();

/** Sender en hendelse til Umami. Gjør ingenting hvis skriptet ikke er lastet. */
export function track(name: string, data?: UmamiData, onceKey?: string) {
  if (typeof window === "undefined") return;
  if (onceKey) {
    if (sent.has(onceKey)) return;
    sent.add(onceKey);
  }
  try {
    window.umami?.track(name, data);
  } catch {
    // Telling skal aldri stoppe siden.
  }
}