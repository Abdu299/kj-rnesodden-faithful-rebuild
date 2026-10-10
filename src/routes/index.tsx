import { createFileRoute } from "@tanstack/react-router";
import { OrderingApp } from "../components/OrderingApp";
import { SITE_IMAGE, SITE_URL } from "../lib/site";

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#bedrift`,
  name: "KjørNesodden",
  description:
    "Lokal levering på Nesodden fra restauranter, hurtigmat og dagligvarebutikker. Fast pris etter område, betaling ved levering.",
  url: SITE_URL,
  image: SITE_IMAGE,
  logo: `${SITE_URL}/images/kjornesodden-logo-kvadrat.png`,
  telephone: "+4793461991",
  email: "kjrnesodden@gmail.com",
  priceRange: "75 til 150 kr per levering",
  areaServed: { "@type": "AdministrativeArea", name: "Nesodden kommune" },
  makesOffer: [
    { area: "Tangen, Bjørnemyr og Helvik", price: 75 },
    { area: "Alværn, Fjordvangen og Fjellstrand", price: 100 },
    { area: "Fagerstrand", price: 150 },
  ].map(({ area, price }) => ({
    "@type": "Offer",
    name: `Levering til ${area}`,
    price,
    priceCurrency: "NOK",
  })),
};


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KjørNesodden | Mat levert hjem fra restauranter på Nesodden" },
      {
        name: "description",
        content:
          "KjørNesodden tilbyr rask og rimelig levering fra restauranter og lokale butikker på Nesodden. Bestill enkelt og spar tid.",
      },
      { property: "og:title", content: "KjørNesodden | Mat levert hjem fra restauranter på Nesodden" },
      {
        property: "og:description",
        content: "Rask og rimelig levering fra restauranter og butikker på Nesodden.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: SITE_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <OrderingApp />;
}
