import { Link, createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { formatKr } from "../lib/catalog";
import { breadcrumbSchema, lowestFee, placePages, placeUrl } from "../lib/places";
import { SITE_IMAGE, SITE_URL } from "../lib/site";

const URL = `${SITE_URL}/restauranter`;
const TITLE = "Restauranter på Nesodden med levering | KjørNesodden";
const DESCRIPTION = `Alle restaurantene du kan bestille fra med KjørNesodden. Se menyene og få maten kjørt hjem på Nesodden fra ${formatKr(lowestFee())}.`;

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
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Forsiden", url: `${SITE_URL}/` },
            { name: "Restauranter", url: URL },
          ]),
        ),
      },
    ],
  }),
  component: PlacesIndex,
});

function PlacesIndex() {
  return (
    <div className="kn-root about-page place-page">
      <section className="hero about-hero">
        <TopBar active="places" />
        <div className="about-intro">
          <nav className="place-crumbs" aria-label="Brødsmuler">
            <Link to="/">Forsiden</Link>
            <span aria-hidden="true"> › </span>
            <span>Restauranter</span>
          </nav>
          <span className="about-eyebrow">Levering på Nesodden</span>
          <h1>Restauranter på Nesodden</h1>
          <p>
            Her er stedene du kan bestille fra med KjørNesodden. Velg et sted for å se menyen, så
            henter vi maten og kjører den hjem til deg. Du betaler ved levering.
          </p>
        </div>
      </section>

      <main className="about-content place-content">
        <div className="place-list">
          {placePages.map(({ place, restaurant }) => (
            <Link
              className="place-card"
              key={place.slug}
              to="/restauranter/$slug"
              params={{ slug: place.slug }}
            >
              <img
                src={restaurant.image}
                alt={restaurant.id === "mamagreek" ? "Illustrasjon av gresk mat" : restaurant.name}
                loading="lazy"
                width="600"
                height="340"
              />
              <span className="place-card-body">
                <b>{restaurant.name}</b>
                <span>{restaurant.cuisine}</span>
                <span>{restaurant.address}</span>
                <span className="place-card-link">
                  {restaurant.orderingMode === "menu" ? "Se menyen" : "Bestill via oss"} ›
                </span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
