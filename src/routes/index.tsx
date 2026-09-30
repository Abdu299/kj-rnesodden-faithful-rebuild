import { createFileRoute } from "@tanstack/react-router";
import { OrderingApp } from "../components/OrderingApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KjørNesodden – Rask levering på Nesodden" },
      {
        name: "description",
        content:
          "KjørNesodden tilbyr rask og rimelig levering fra restauranter og lokale butikker på Nesodden. Bestill enkelt og spar tid.",
      },
      { property: "og:title", content: "KjørNesodden – Rask levering på Nesodden" },
      {
        property: "og:description",
        content: "Rask og rimelig levering fra restauranter og butikker på Nesodden.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return <OrderingApp />;
}
