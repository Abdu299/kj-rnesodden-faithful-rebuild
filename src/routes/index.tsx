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
    "Lokal levering på Nesodden fra restauranter, hurtigmat og dagligvarebutikker. Pris ut fra hentested og leveringsadresse, betaling ved levering.",
  url: SITE_URL,
  image: SITE_IMAGE,
  logo: `${SITE_URL}/images/kjornesodden-logo-kvadrat.png`,
  telephone: "+4793461991",
  email: "kjrnesodden@gmail.com",
  priceRange: `${Math.min(...zones.map((zone) => zone.fee))} til ${Math.max(...zones.map((zone) => zone.fee))} kr per levering`,
  areaServed: { "@type": "AdministrativeArea", name: "Nesodden kommune" },
  sameAs: ["https://www.facebook.com/61592634265932", "https://www.instagram.com/kjornesodden/"],
};

const LOWEST_FEE = Math.min(...zones.map((zone) => zone.fee));
const DESCRIPTION = `Bestill mat fra Signalen, Tonys Sushi, JAFS, O' Sole Mio og flere på Nesodden. Vi kjører maten hjem fra ${LOWEST_FEE} kr, og du betaler når den kommer.`;


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KjørNesodden | Mat levert hjem fra restauranter på Nesodden" },
      {
        name: "description",
        content: DESCRIPTION,
      },
      { property: "og:title", content: "KjørNesodden | Mat levert hjem fra restauranter på Nesodden" },
      {
        property: "og:description",
        content: DESCRIPTION,
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
