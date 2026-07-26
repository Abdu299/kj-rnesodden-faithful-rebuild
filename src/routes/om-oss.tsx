import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/om-oss")({
  head: () => ({
    meta: [
      { title: "Om oss – KjørNesodden" },
      {
        name: "description",
        content:
          "KjørNesodden leverer fra restauranter, dagligvarebutikker og hurtigmatkjeder på Nesodden. Se leveringsområder, priser og kontaktinformasjon.",
      },
      { property: "og:title", content: "Om oss – KjørNesodden" },
      {
        property: "og:description",
        content:
          "Våre tjenester, leveringsområder og kontaktinformasjon på Nesodden.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/om-oss" },
    ],
    links: [{ rel: "canonical", href: "/om-oss" }],
  }),
  component: OmOss,
});

const RESTAURANTS = [
  "Viva Napoli Nesodden",
  "Pizzabakeren Nesodden",
  "Jafs Nesodden",
  "Tony’s Sushi Og Thai Restaurant",
  "Jonathan Sushi Nesodden",
  "Nye Flaskebekk Bistro",
  "Tåste Restaurant",
  "O’ Sole Mio",
  "MAMA GREEK KITCHEN",
  "Primitivo Ristorante",
  "Pio Pio pizzeria",
  "Annas Hybel",
  "Fagerstrand Vertshus AS",
];

const GROCERIES = ["Meny", "Kiwi", "Coop Extra", "Coop Prix", "Joker", "Mester Grønn (Tangen)"];

function OmOss() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <TopBar active="about" />

        <div className="about-container">
          <div className="about-grid about-grid-top">
            <div className="about-card">
              <h2 className="about-title">Våre tjenester</h2>
              <h3 className="about-subtitle">Restaurantlevering</h3>
              <ul className="about-list">
                {RESTAURANTS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="about-card">
              <h2 className="about-title">Våre leveringer priser</h2>
              <div className="about-prices">
                <div className="about-price-row">
                  <span className="about-area">Tangen/Bjørnemyr/Helvik området</span>
                  <span className="about-kr">75 kr</span>
                </div>
                <div className="about-price-row">
                  <span className="about-area">Alværn/ Fjordvangen/ Fjellstrand</span>
                  <span className="about-kr">100 kr</span>
                </div>
                <div className="about-price-row">
                  <span className="about-area">Fagerstrand Området</span>
                  <span className="about-kr">150 kr</span>
                </div>
              </div>

              <div className="about-map">
                <img src="/nesodden-map.png" alt="Leveringsområder på Nesodden" />
              </div>

              <div className="about-legend">
                <div className="legend-row legend-orange">
                  Oransje: <strong>75 kr</strong>
                </div>
                <div className="legend-row legend-green">
                  Grønn: <strong>100 kr</strong>
                </div>
                <div className="legend-row legend-blue">
                  Blå: <strong>150 kr</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="about-grid about-grid-bottom">
            <div className="about-card">
              <h2 className="about-subtitle">Vi kan også hente og levere mat fra</h2>
              <ul className="about-list">
                <li>McDonald's Nygaardskrysset</li>
                <li>Burger King Vinterbro</li>
              </ul>

              <h3 className="about-subtitle" style={{ marginTop: 28 }}>
                Dagligvarehenting
              </h3>
              <ul className="about-list">
                {GROCERIES.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="about-card about-contact">
              <h2 className="about-title">Kontakt oss:</h2>
              <p>
                <strong>Arkan:</strong> <a href="tel:+4793461991">934 61 991</a>
              </p>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}