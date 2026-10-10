import { createFileRoute } from "@tanstack/react-router";
import { OrderingApp } from "../components/OrderingApp";
import { formatKr } from "../lib/catalog";
import { lowestFee, placePages, placeUrl } from "../lib/places";
import { SITE_IMAGE, SITE_URL } from "../lib/site";

const URL = `${SITE_URL}/restauranter`;
const TITLE = "Restauranter på Nesodden med levering | KjørNesodden";
const DESCRIPTION = `Alle restaurantene du kan bestille fra med KjørNesodden. Se menyene og få maten kjørt hjem på Nesodden fra ${formatKr(lowestFee())}.`;

// Samme oppsett som forsiden, men med egen overskrift og tekst for «restaurant nesodden».
export const Route = createFileRoute("/restauranter/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: SITE_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Restauranter på Nesodden med levering",
          itemListElement: placePages.map((page, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: page.restaurant.name,
            url: placeUrl(page.place),
          })),
        }),
      },
    ],
  }),
  component: PlacesIndex,
});

function PlacesIndex() {
  return (
    <OrderingApp
      active="places"
      homeTitle={
        <>
          Restauranter
          <br />
          på Nesodden
        </>
      }
      homeIntro="Her er stedene du kan bestille fra med KjørNesodden, fra Nesoddtangen til Fagerstrand. Velg et sted for å se menyen, så henter vi maten og kjører den hjem til deg."
    />
  );
}
