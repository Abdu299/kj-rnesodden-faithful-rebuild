import { addressHandler } from "../shared/address-service.js";

// Serve the same lookup when Vercel uses its native api/ directory.
export default async function handler(req, res) {
  const url = new URL(req.url || "/api/addresses", `https://${req.headers.host}`);
  const response = await addressHandler(new Request(url, { method: req.method }));
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}
