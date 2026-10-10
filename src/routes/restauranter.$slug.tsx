import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { formatKr, type Restaurant } from "../lib/catalog";
import {
  breadcrumbSchema,
  descriptionFor,
  faqFor,
  headingFor,
  lowestFee,
  menuSummary,
  openingRows,
  pageBySlug,
  placeImage,
  placePages,
  placeUrl,
  titleFor,
  type PlacePage,
} from "../lib/places";
import { SITE_URL } from "../lib/site";
import { zones } from "../../shared/order-rules.js";

export const Route = createFileRoute("/restauranter/$slug")({
  loader: ({ params }) => {
    if (!pageBySlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    const page = loaderData ? pageBySlug(loaderData.slug) : null;
    if (!page) return {};
    const url = placeUrl(page.place);
    const title = titleFor(page);
    const description = descriptionFor(page);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: placeImage(page.restaurant) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(restaurantSchema(page)) },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: "Forsiden", url: `${SITE_URL}/` },
              { name: "Restauranter", url: `${SITE_URL}/restauranter` },
              { name: page.restaurant.name, url },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqSchema(page)) },
      ],
    };
  },
  component: PlacePageView,
});

function restaurantSchema(page: PlacePage) {
  const { place, restaurant } = page;
  const url = placeUrl(place);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: restaurant.name,
    servesCuisine: restaurant.cuisine,
    image: placeImage(restaurant),
    url,
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: "Nesodden",
      addressCountry: "NO",
    },
    ...(restaurant.orderingMode === "menu" ? { hasMenu: `${url}#meny` } : {}),
    ...(place.website ? { sameAs: [place.website] } : {}),
  };
}

function faqSchema(page: PlacePage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqFor(page).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function priceText(variants: Restaurant["categories"][number]["items"][number]["variants"]) {
  return variants
    .map((variant) => `${variant.label ? `${variant.label} ` : ""}${formatKr(variant.price)}`)
    .join(" · ");
}

function PlacePageView() {
  const { slug } = Route.useLoaderData();
  const page = pageBySlug(slug)!;
  const { place, restaurant } = page;
  const hero = restaurant.banner || restaurant.image;
  const hours = openingRows(restaurant);
  const summary = menuSummary(restaurant);
  const others = placePages.filter((other) => other.place.slug !== place.slug);

  return (
    <div className="kn-root about-page place-page">
      <section
        className="hero about-hero place-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(10, 18, 39, 0.92), rgba(10, 18, 39, 0.78)), url('${hero}')`,
        }}
      >
        <TopBar active="places" />
        <div className="about-intro">
          <nav className="place-crumbs" aria-label="Brødsmuler">
            <Link to="/">Forsiden</Link>
            <span aria-hidden="true"> › </span>
            <Link to="/restauranter">Restauranter</Link>
            <span aria-hidden="true"> › </span>
            <span>{restaurant.name}</span>
          </nav>
          <span className="about-eyebrow">{restaurant.cuisine}</span>
          <h1>{headingFor(page)}</h1>
          <p>
            {restaurant.address} · Levering fra {formatKr(lowestFee())} · Du betaler ved levering
          </p>
          <a className="place-cta" href={`/#${restaurant.id}`}>
            Bestill fra {restaurant.name}
          </a>
        </div>
      </section>

      <main className="about-content place-content">
        <div className="place-grid">
          <div className="place-main">
            <section className="about-panel">
              <span className="about-panel-label">Om stedet</span>
              <h2>{restaurant.name}</h2>
              <p>{place.intro}</p>
              {summary && <p>{summary}</p>}
              {place.website && (
                <p>
                  {restaurant.name} har egen nettside:{" "}
                  <a href={place.website} rel="noopener">
                    {place.website.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              )}
            </section>

            {restaurant.orderingMode === "menu" && restaurant.categories.length > 0 && (
              <section className="about-panel" id="meny">
                <span className="about-panel-label">Meny</span>
                <h2>Menyen til {restaurant.name}</h2>
                {restaurant.note && <p className="place-note">{restaurant.note}</p>}
                {restaurant.categories.map((category) => (
                  <div className="place-category" key={category.id}>
                    <h3>{category.name}</h3>
                    {category.description && <p className="place-note">{category.description}</p>}
                    <ul className="place-menu">
                      {category.items.map((item) => (
                        <li key={item.id}>
                          <div className="place-item">
                            <span className="place-item-name">
                              {item.number ? `${item.number}. ` : ""}
                              {item.name}
                            </span>
                            <span className="place-item-price">{priceText(item.variants)}</span>
                          </div>
                          {item.description && <p>{item.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <a className="place-cta" href={`/#${restaurant.id}`}>
                  Bestill fra {restaurant.name}
                </a>
              </section>
            )}

            <section className="about-panel">
              <span className="about-panel-label">Spørsmål og svar</span>
              <h2>Det folk lurer på</h2>
              {faqFor(page).map((item) => (
                <div className="place-faq" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </section>
          </div>

          <aside className="place-side">
            <section className="about-panel price-panel">
              <span className="about-panel-label">Levering</span>
              <h2>Fast pris etter område</h2>
              <div className="about-price-list">
                {zones.map((zone) => (
                  <div className="about-price-row" key={zone.id}>
                    <span>{zone.name}</span>
                    <strong>{formatKr(zone.fee)}</strong>
                  </div>
                ))}
              </div>
            </section>

            {hours.length > 0 && (
              <section className="about-panel price-panel">
                <span className="about-panel-label">Åpningstider</span>
                <h2>Når du kan bestille</h2>
                <div className="about-price-list">
                  {hours.map((row) => (
                    <div className="about-price-row" key={row.day}>
                      <span>{row.day}</span>
                      <strong>{row.text}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="about-panel">
              <span className="about-panel-label">Andre steder på Nesodden</span>
              <div className="place-chips">
                {others.map((other) => (
                  <Link
                    key={other.place.slug}
                    to="/restauranter/$slug"
                    params={{ slug: other.place.slug }}
                  >
                    {other.restaurant.name}
                  </Link>
                ))}
              </div>
              <p>
                <Link to="/restauranter">Se alle restaurantene</Link>
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
