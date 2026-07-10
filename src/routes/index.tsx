import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { OrderForm } from "../components/OrderForm";

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
  return (
    <div className="kn-root">
      <section className="hero">
        <TopBar active="home" />

        <div className="main">
          <div className="left">
            <h1>Bestill med KjørNesodden!</h1>
            <p className="lead">
              KjørNesodden tilbyr rask og rimelig levering fra alle restauranter på
              Nesodden og fra lokale butikker, slik at du sparer både tid og penger.
            </p>
            <div className="price-list">
              <div className="price-row">
                <span className="area">Tangen / Bjørnemyr / Helvik området</span>
                <span className="price">75 kr</span>
              </div>
              <div className="price-row">
                <span className="area">Alværn / Fjordvangen / Fjellstrand</span>
                <span className="price">100 kr</span>
              </div>
              <div className="price-row">
                <span className="area">Fagerstrand området</span>
                <span className="price">150 kr</span>
              </div>
            </div>
          </div>

          <aside className="right">
            <h2 className="panel-title">Bestill rask levering på Nesodden</h2>
            <div className="panel-sub">
              Fra restauranter og lokale butikker - raskt og rimelig
            </div>
            <OrderForm />
          </aside>
        </div>
      </section>
    </div>
  );
}
