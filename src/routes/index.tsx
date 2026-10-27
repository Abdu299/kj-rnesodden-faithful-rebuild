import { createFileRoute } from "@tanstack/react-router";
import { OrderingApp } from "../components/OrderingApp";
import { SITE_IMAGE, SITE_URL } from "../lib/site";
import { zones } from "../../shared/order-rules.js";

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
  priceRange: `${Math.min(...zones.map((zone) => zone.fee))} til ${Math.max(...zones.map((zone) => zone.fee))} kr per levering`,
  areaServed: { "@type": "AdministrativeArea", name: "Nesodden kommune" },
  makesOffer: zones.map(({ name, fee }) => ({
    "@type": "Offer",
    name: `Levering til ${name}`,
    price: fee,
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
