import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { OrderingApp } from "../components/OrderingApp";
import { formatKr } from "../lib/catalog";
import {
  breadcrumbSchema,
  descriptionFor,
  faqFor,
  headingFor,
  menuSummary,
  pageBySlug,
  placeImage,
  placePages,
  placeUrl,
  titleFor,
  type PlacePage,
} from "../lib/places";
import { SITE_URL } from "../lib/site";
import { zones } from "../../shared/order-rules.js";

// Restaurantens egen side er selve bestillingssiden.
// Kunden fra Google lander rett på menyen med «Legg i kurven».
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
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: "Nesodden",
      addressCountry: "NO",
    },
    ...(restaurant.orderingMode === "menu" ? { hasMenu: url } : {}),
        // hours[0] er søndag. Stengte dager (null) utelates.
        ...(restaurant.hours
          ? {
              openingHoursSpecification: restaurant.hours.flatMap((h, day) => {
                if (!h) return [];
                const tid = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
                const dag = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
                return [{ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${dag}`, opens: tid(h[0]), closes: tid(h[1]) }];
              }),
            }
          : {}),
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

function PlacePageView() {
  const { slug } = Route.useLoaderData();
  const page = pageBySlug(slug)!;
  return (
    <OrderingApp
      key={page.restaurant.id}
      initialView={page.restaurant.id}
      heading={headingFor(page)}
      extra={<PlaceInfo page={page} />}
    />
  );
}

// Tekst under menyen: det Google trenger, uten å stå i veien for bestillingen.
function PlaceInfo({ page }: { page: PlacePage }) {
  const { place, restaurant } = page;
  const summary = menuSummary(restaurant);
  const others = placePages.filter((other) => other.place.slug !== place.slug);
  return (
    <section className="place-info" aria-label={`Om ${restaurant.name}`}>
      <div className="place-info-card">
        <h2>Om {restaurant.name}</h2>
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
        <h3>Levering fra {restaurant.name}</h3>
        <ul className="place-info-prices">
          {zones.map((zone) => (
            <li key={zone.id}>
              <span>{zone.name}</span>
              <b>{formatKr(zone.fee)}</b>
            </li>
          ))}
        </ul>
        <p>
          <Link to="/om-oss" hash="leveringsomrader">
            Se kart over leveringsområdene
          </Link>
        </p>
      </div>
      <div className="place-info-card">
        <h2>Spørsmål og svar</h2>
        {faqFor(page).map((item) => (
          <div className="place-info-faq" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
      <div className="place-info-card place-info-wide">
        <h2>Andre restauranter på Nesodden</h2>
        <div className="place-chips">
          {others.map((other) => (
            <Link key={other.place.slug} to="/restauranter/$slug" params={{ slug: other.place.slug }}>
              {other.restaurant.name}
            </Link>
          ))}
          <Link to="/" hash="restauranter">Se alle</Link>
        </div>
      </div>
    </section>
  );
}
