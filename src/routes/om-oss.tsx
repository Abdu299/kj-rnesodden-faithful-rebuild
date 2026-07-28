import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/om-oss")({
  head: () => ({
    meta: [
      { title: "Om oss – KjørNesodden" },
      {
        name: "description",
        content:
          "Les mer om KjørNesodden, våre leveringsområder, priser og steder vi henter fra.",
      },
      { property: "og:title", content: "Om oss – KjørNesodden" },
      {
        property: "og:description",
        content: "Våre tjenester, leveringsområder og kontaktinformasjon på Nesodden.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/om-oss" },
    ],
    links: [{ rel: "canonical", href: "/om-oss" }],
  }),
  component: OmOss,
});

const RESTAURANTS = [
  "Skriv resturanten også gir ved beskyd om vi kan hente!"
];

const GROCERIES = [

  "Kiwi",
  "Coop Extra",
  "REMA 1000",
  "Joker",

];

const PRICES = [
  { area: "Tangen / Bjørnemyr / Helvik", price: "75 kr" },
  { area: "Alværn / Fjordvangen / Fjellstrand", price: "100 kr" },
  { area: "Fagerstrand", price: "150 kr" },
];

function OmOss() {
  return (
    <div className="kn-root about-page">
      <section className="hero about-hero">
        <TopBar active="about" />

        <div className="about-intro">
          <span className="about-eyebrow">LOKAL LEVERING PÅ NESODDEN</span>
          <h1>En enklere måte å få maten levert hjem</h1>
          <p>
            Vi henter fra restauranter og lokale butikker og leverer raskt til døren din.
            Enkelt, lokalt og rimelig.
          </p>
        </div>
      </section>

      <main className="about-content">
        <section className="about-section about-overview-grid">
          <article className="about-panel about-panel-large">
            <span className="about-panel-label">Våre tjenester</span>
            <h2>Restaurantlevering</h2>
            <p className="about-panel-copy">
              Velg blant populære restauranter på Nesodden. Vi henter bestillingen og
              leverer den direkte til deg.
            </p>

            <div className="restaurant-grid">
              {RESTAURANTS.map((restaurant) => (
                <div className="restaurant-item" key={restaurant}>
                  <span className="restaurant-dot" aria-hidden="true" />
                  <span>{restaurant}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="about-panel price-panel">
            <span className="about-panel-label">Leveringspriser</span>
            <h2>Fast pris etter område</h2>

            <div className="about-price-list">
              {PRICES.map((item) => (
                <div className="about-price-row" key={item.area}>
                  <span>{item.area}</span>
                  <strong>{item.price}</strong>
                </div>
              ))}
            </div>

            <div className="about-map">
              <img src="/nesodden-map.png" alt="Kart over leveringsområder på Nesodden" />
            </div>
          </aside>
        </section>

        <section className="about-section about-secondary-grid">
          <article className="about-panel">
            <span className="about-panel-label">Vi henter også fra</span>
            <h2>Butikker og restauranter utenfor Nesodden</h2>
            <div className="service-columns">
              <div>
                <h3>Hurtigmat</h3>
                <p>McDonald&apos;s Nygaardskrysset</p>
                <p>Burger King Vinterbro</p>
              </div>
              <div>
                <h3>Dagligvarer</h3>
                {GROCERIES.map((store) => (
                  <p key={store}>{store}</p>
                ))}
              </div>
            </div>
          </article>

          <article className="about-panel contact-panel">
            <span className="about-panel-label">Kontakt</span>
            <h2>Har du spørsmål?</h2>
            <p>
              Ring oss, så hjelper vi deg med bestilling, leveringsområde eller andre
              spørsmål.
            </p>
            <a className="contact-button" href="tel:+4793461991">
              Ring Arkan: 934 61 991
            </a>
          </article>
        </section>
      </main>
    </div>
  );
}
