import { createFileRoute } from "@tanstack/react-router";
import { orderHandler } from "../../shared/order-service.js";
export const Route = createFileRoute("/api/send")({
  server: {
    handlers: {
      POST: ({ request }) => orderHandler(request),
      OPTIONS: ({ request }) => orderHandler(request),
      GET: ({ request }) => orderHandler(request),
    },
  },
});
