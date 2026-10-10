import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { SITE_IMAGE, SITE_URL } from "../lib/site";
import { placePages } from "../lib/places";
import { Reviews } from "../components/Reviews";

const TITLE = "Om KjørNesodden | Lokal matlevering på hele Nesodden";
const DESCRIPTION =
  "KjørNesodden henter mat fra restauranter og varer fra butikker og kjører det hjem til deg på Nesodden. Fast pris fra 75 kr, du betaler når du har fått varene.";

const PRICES = [
  { area: "Tangen / Bjørnemyr / Helvik", price: "75 kr" },
  { area: "Alværn / Fjordvangen / Fjellstrand", price: "100 kr" },
  { area: "Fagerstrand", price: "150 kr" },
];

const STEPS = [
  {
    title: "Du bestiller",
    text: "Velg restaurant og legg maten i kurven. Skal du ha noe fra butikken, skriver du hva og hvor.",
  },
  {
    title: "Vi henter",
    text: "Vi henter bestillingen så snart den er klar. Du kan bestille når restauranten har åpent.",
  },
  {
    title: "Du betaler ved døra",
    text: "Vi kjører varene hjem til deg. Du betaler først når du har fått dem.",
  },
];

const FAQ = [
  {
    q: "Hva koster levering med KjørNesodden?",
    a: "Prisen er fast og avhenger av hvor du bor: 75 kr til Tangen, Bjørnemyr og Helvik, 100 kr til Alværn, Fjordvangen og Fjellstrand, og 150 kr til Fagerstrand.",
  },
  {
    q: "Når betaler jeg?",
    a: "Du betaler når varene er levert. Du trenger ikke betale noe på forhånd.",
  },
  {
    q: "Når kan jeg bestille?",
    a: "Du kan bestille når restauranten har åpent. Åpningstidene står på siden til hver restaurant.",
  },
  {
    q: "Leverer dere utenfor Nesodden?",
    a: "Nei. Vi leverer bare til adresser i Nesodden kommune, men vi kan hente fra McDonald's Nygaardskrysset og Burger King Vinterbro.",
  },
  {
    q: "Kan dere hente fra et sted som ikke står på lista?",
    a: "Ofte, ja. Skriv hva du vil ha og hvor vi skal hente, eller ring oss, så gir vi beskjed om vi kan hente.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export const Route = createFileRoute("/om-oss")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/om-oss` },
      { property: "og:image", content: SITE_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/om-oss` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }],
  }),
  component: OmOss,
});

function OmOss() {
  return (
    <div className="kn-root about-page">
      <section className="hero about-hero">
        <SiteHeader onHero current={"about"} />

        <div className="about-intro">
          <span className="about-eyebrow">Om KjørNesodden</span>
          <h1>Nesoddens egen budtjeneste</h1>
          <p>
            Vi henter mat fra restaurantene og varer fra butikkene, og kjører det hjem til deg.
            Fast pris etter hvor du bor, og du betaler først når du har fått det.
          </p>
        </div>
      </section>

      <main className="about-content">
        <section className="about-section about-story-grid">
          <article className="about-panel">
            <span className="about-panel-label">Hvorfor vi finnes</span>
            <h2>Levering som var laget for Nesodden</h2>
            <p className="about-panel-copy">
              KjørNesodden startet sommeren 2026. Flere av de beste spisestedene her finnes ikke
              på de store leveringsappene, og butikkene leverer ikke samme dag. Det ville vi gjøre
              noe med.
            </p>
            <p className="about-panel-copy">
              Vi kjører hele halvøya, fra Tangen til Fagerstrand, og vi kjenner veiene, stedene og
              folka som lager maten.
            </p>
            <p className="about-press">
              Omtalt i{" "}
              <a
                href="https://www.amta.no/satser-pa-ny-tjeneste-pa-nesodden-vi-sa-at-det-manglet/s/5-3-2019946"
                target="_blank"
                rel="noopener"
              >
                Amta, juli 2026
              </a>
            </p>
          </article>

          <article className="about-panel about-steps-panel">
            <span className="about-panel-label">Slik fungerer det</span>
            <h2>Tre steg</h2>
            <ol className="about-steps">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className="about-step-number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <Reviews />

        <section className="about-section about-overview-grid">
          <article className="about-panel">
            <span className="about-panel-label">Mer enn restaurantmat</span>
            <h2>Vi henter det du trenger</h2>
            <div className="service-columns">
              <div>
                <h3>Dagligvarer</h3>
                <p>Kiwi</p>
                <p>Coop Extra</p>
                <p>REMA 1000</p>
                <p>Joker</p>
              </div>
              <div>
                <h3>Hurtigmat</h3>
                <p>McDonald&apos;s Nygaardskrysset</p>
                <p>Burger King Vinterbro</p>
              </div>
            </div>
            <p className="about-panel-copy">
              Trenger du noe annet, for eksempel brød, frukt eller blomster? Skriv hva du vil ha
              og hvor vi skal handle. Prisen på varene kommer i tillegg til leveringen.
            </p>

            <h3 className="about-restaurants-title">Restaurantene vi henter fra</h3>
            <div className="restaurant-grid">
              {placePages.map(({ place, restaurant }) => (
                <Link
                  className="restaurant-item"
                  key={place.slug}
                  to="/restauranter/$slug"
                  params={{ slug: place.slug }}
                >
                  <span className="restaurant-dot" aria-hidden="true" />
                  <span>{restaurant.name}</span>
                </Link>
              ))}
            </div>
          </article>

          <aside className="about-panel price-panel" id="leveringsomrader">
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
              <img src="/nesodden-map.png" alt="Kart over leveringsområdene til KjørNesodden" />
            </div>
          </aside>
        </section>

        <section className="about-section about-secondary-grid">
          <article className="about-panel">
            <span className="about-panel-label">Spørsmål og svar</span>
            <h2>Det folk lurer på</h2>
            <div className="about-faq">
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <article className="about-panel contact-panel">
            <span className="about-panel-label">Kontakt</span>
            <h2>Har du spørsmål?</h2>
            <p>Ring oss, så hjelper vi deg med bestilling, leveringsområde eller noe annet.</p>
            <a className="contact-button" href="tel:+4793461991">
              Ring oss: 934 61 991
            </a>
            <p className="contact-mail">
              E-post: <a href="mailto:kjrnesodden@gmail.com">kjrnesodden@gmail.com</a>
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}