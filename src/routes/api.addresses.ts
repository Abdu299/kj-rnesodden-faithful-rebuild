import { createFileRoute } from "@tanstack/react-router";
import { addressHandler } from "../../shared/address-service.js";
export const Route = createFileRoute("/api/addresses")({
  server: { handlers: { GET: ({ request }) => addressHandler(request) } },
});
