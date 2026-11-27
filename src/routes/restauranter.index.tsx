import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { SITE_IMAGE, SITE_URL } from "../lib/site";
import { breadcrumbSchema, lowestFee, placePages, placeUrl, type PlacePage } from "../lib/places";
import { formatKr } from "../lib/catalog";
import { openingStatus } from "../../shared/order-rules.js";

// Samleside for de brede søkene («restaurant nesodden», «take away nesodden»).
// Forsiden er der man bestiller. Denne siden er for den som kommer fra Google og vil se
// hva som finnes, delt på område. Hver rad går til den samme restaurantsiden som kortene på forsiden.
// Den gamle /restauranter ble fjernet 10.10 fordi den var lik forsiden. Denne har egen tekst og eget oppsett.

const URL_HER = `${SITE_URL}/restauranter`;

// Område etter hvor stedet ligger, ikke postnummer (Flaskebekk har postnummer 1452 Nesoddtangen).
// Nytt sted? Legg det til her. Står det ikke her, havner det under «Andre steder».
const AREAS = [
  { id: "nesoddtangen", name: "Nesoddtangen", places: ["signalen", "osolemio", "jonathan", "jafs"] },
  { id: "flaskebekk", name: "Flaskebekk", places: ["tonys", "bistro"] },
  { id: "fagerstrand", name: "Fagerstrand", places: ["fagerstrand"] },
];

const TALL = ["null", "ett", "to", "tre", "fire", "fem", "seks", "sju", "åtte", "ni", "ti"];
const antall = (n: number) => (n <= 10 ? TALL[n] : String(n));
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function liste(navn: string[]) {
  if (navn.length <= 1) return navn.join("");
  return `${navn.slice(0, -1).join(", ")} og ${navn[navn.length - 1]}`;
}

const grupper = (() => {
  const brukt = new Set<string>();
  const ut = AREAS.map((area) => {
    const pages = area.places
      .map((id) => placePages.find((p) => p.place.id === id))
      .filter((p): p is PlacePage => Boolean(p));
    pages.forEach((p) => brukt.add(p.place.id));
    return { ...area, pages };
  }).filter((a) => a.pages.length);
  const resten = placePages.filter((p) => !brukt.has(p.place.id));
  if (resten.length) ut.push({ id: "andre", name: "Andre steder", places: [], pages: resten });
  return ut;
})();

const ALLE = grupper.flatMap((g) => g.pages);
const FRA = formatKr(lowestFee());
const OMRADER = liste(grupper.filter((g) => g.id !== "andre").map((g) => g.name));

const medMat = (ord: string) =>
  ALLE.filter((p) => p.restaurant.cuisine.toLowerCase().includes(ord)).map((p) => p.restaurant.name);

const TITLE = "Restauranter på Nesodden | Take away og levering | KjørNesodden";
const DESCRIPTION = `${stor(antall(ALLE.length))} restauranter på ${OMRADER} med meny, priser og åpningstider. Bestill take away på nett og få maten kjørt hjem fra ${FRA}.`;

const FAQ = [
  {
    q: "Hvilke restauranter på Nesodden har take away?",
    a:
      grupper.map((g) => `${liste(g.pages.map((p) => p.restaurant.name))} ${g.id === "andre" ? "" : `på ${g.name}`}`.trim()).join(". ") +
      `. Alle lager mat du kan ta med. Bestiller du her, henter vi maten og kjører den hjem til deg.`,
  },
  {
    q: "Hvem kjører mat hjem på Nesodden?",
    a: `KjørNesodden henter fra restaurantene på denne siden og kjører til adresser i hele Nesodden kommune. Levering koster fra ${FRA}, og prisen vises når du har skrevet adressen. Du betaler når maten kommer.`,
  },
  ...(medMat("pizza").length
    ? [{ q: "Hvor får jeg pizza på Nesodden?", a: `Pizza har ${liste(medMat("pizza"))}. Menyen og prisene står på siden til hver av dem.` }]
    : []),
  ...(medMat("sushi").length
    ? [{ q: "Hvor får jeg sushi på Nesodden?", a: `Sushi har ${liste(medMat("sushi"))}. Hos Tonys kan du legge thairetter i samme bestilling.` }]
    : []),
];

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Restauranter på Nesodden",
  numberOfItems: ALLE.length,
  itemListElement: ALLE.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: placeUrl(p.place),
    name: p.restaurant.name,
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export const Route = createFileRoute("/restauranter/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL_HER },
      { property: "og:image", content: SITE_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL_HER }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(itemList) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Forsiden", url: `${SITE_URL}/` },
            { name: "Restauranter på Nesodden", url: URL_HER },
          ]),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqSchema) },
    ],
  }),
  component: Samleside,
});

function Rad({ page, now }: { page: PlacePage; now: Date | null }) {
  const { place, restaurant: r } = page;
  const status = now ? openingStatus(r, now) : null;
  const gate = place.address?.street ?? r.address;
  return (
    <Link className="samle-rad" to="/restauranter/$slug" params={{ slug: place.slug }}>
      <img src={r.image} alt={r.name} width="160" height="110" loading="lazy" />
      <div className="samle-tekst">
        <h3>{r.name}</h3>
        <p>
          {r.cuisine} · {gate}
        </p>
        {status && (
          <span className={`opening-status ${status.open ? "is-open" : "is-closed"}`}>
            <span aria-hidden="true">●</span> {status.text}
          </span>
        )}
      </div>
      <span className="card-cta samle-knapp">
        {r.orderingMode === "menu" ? "Se meny og bestill" : "Send forespørsel"}
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}

function Samleside() {
  // Klokka settes først i nettleseren, så serveren og nettleseren ikke viser ulik status.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="kn-root about-page samle-page">
      <section className="hero about-hero samle-hero">
        <SiteHeader onHero current={"places"} />
        <div className="about-intro">
          <nav className="samle-crumbs" aria-label="Brødsmuler">
            <Link to="/">Forsiden</Link>
            <span aria-hidden="true"> › </span>
            <span aria-current="page">Restauranter på Nesodden</span>
          </nav>
          <h1>Restauranter på Nesodden</h1>
          <p>
            {stor(antall(ALLE.length))} spisesteder på {OMRADER}, med meny, priser og åpningstider.
            Bestill på nett, så henter vi maten og kjører den hjem til deg. Levering fra {FRA}, og du
            betaler når maten kommer.
          </p>
        </div>
      </section>

      <main className="about-content samle-content">
        {grupper.map((g) => (
          <section className="about-panel samle-omrade" key={g.id} aria-labelledby={`omrade-${g.id}`}>
            <h2 id={`omrade-${g.id}`}>
              {g.id === "andre" ? g.name : `Restauranter på ${g.name}`}
              <span className="samle-antall">{antall(g.pages.length)} {g.pages.length === 1 ? "sted" : "steder"}</span>
            </h2>
            <div className="samle-liste">
              {g.pages.map((p) => (
                <Rad page={p} now={now} key={p.place.id} />
              ))}
            </div>
          </section>
        ))}

        <section className="about-panel samle-faq">
          <span className="about-panel-label">Spørsmål og svar</span>
          <h2>Mat på Nesodden</h2>
          <div className="about-faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="samle-tilbake">
            Vil du heller bla i kort? <Link to="/" hash="restauranter">Se restaurantene på forsiden</Link>
          </p>
        </section>
      </main>
    </div>
  );
}