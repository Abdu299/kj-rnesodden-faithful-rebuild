import { orderHandler } from "../shared/order-service.js";

// Vercel adapter; development and SSR use the same service through TanStack.
export default async function handler(req, res) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const request = new Request(`https://${req.headers.host}/api/send`, {
    method: req.method,
    headers,
    ...(!["GET", "HEAD", "OPTIONS"].includes(req.method)
      ? { body: typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}) }
      : {}),
  });
  const response = await orderHandler(request);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}
