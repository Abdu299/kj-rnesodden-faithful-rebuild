// Felles hjelpere for stedssidene (/restauranter og /restauranter/<slug>).
import { places, placeById, placeBySlug, placePath, type Place } from "../../shared/places.js";
import { dayNames, formatTime, zones } from "../../shared/order-rules.js";
import { formatKr, restaurantById, restaurants, type Restaurant } from "./catalog";
import { SITE_IMAGE, SITE_URL } from "./site";

export { places, placeById, placeBySlug, placePath, type Place };

export type PlacePage = { place: Place; restaurant: Restaurant };

export function pageBySlug(slug: string): PlacePage | null {
  const place = placeBySlug(slug);
  const restaurant = place ? restaurantById(place.id) : undefined;
  return place && restaurant ? { place, restaurant } : null;
}

// Alle steder i samme rekkefølge som på forsiden.
export const placePages: PlacePage[] = restaurants
  .map((restaurant) => {
    const place = placeById(restaurant.id);
    return place ? { place, restaurant } : null;
  })
  .filter((page): page is PlacePage => page !== null);

export const placeUrl = (place: Place) => `${SITE_URL}${placePath(place)}`;

export function placeImage(restaurant: Restaurant) {
  const image = restaurant.banner || restaurant.image;
  return image && !image.endsWith(".svg") ? `${SITE_URL}${image}` : SITE_IMAGE;
}

export function headingFor({ place, restaurant }: PlacePage) {
  return place.seoName.includes(restaurant.name) ? place.seoName : `${restaurant.name}, Nesodden`;
}

export function titleFor(page: PlacePage) {
  return `${page.place.seoName} | Meny og levering | KjørNesodden`;
}

export function descriptionFor({ restaurant }: PlacePage) {
  const what =
    restaurant.orderingMode === "menu"
      ? `Se hele menyen til ${restaurant.name} med priser`
      : `Bestill mat fra ${restaurant.name}`;
  return `${what}. Vi henter og kjører hjem til deg på Nesodden fra ${formatKr(lowestFee())}. Du betaler ved levering.`;
}

export const lowestFee = () => Math.min(...zones.map((zone) => zone.fee));

export const itemCount = (restaurant: Restaurant) =>
  restaurant.categories.reduce((sum, category) => sum + category.items.length, 0);

export function listText(words: string[]) {
  const lower = words.map((word) => word.toLowerCase());
  if (lower.length <= 1) return lower.join("");
  return `${lower.slice(0, -1).join(", ")} og ${lower[lower.length - 1]}`;
}

export function menuSummary(restaurant: Restaurant) {
  if (restaurant.orderingMode !== "menu" || !restaurant.categories.length) return "";
  return `Menyen har ${itemCount(restaurant)} retter fordelt på ${listText(
    restaurant.categories.map((category) => category.name),
  )}.`;
}

// Mandag først, slik folk leser en uke.
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export function openingRows(restaurant: Restaurant) {
  if (!restaurant.hours) return [];
  return WEEK.map((day) => {
    const span = restaurant.hours?.[day];
    return {
      day: dayNames[day],
      text: span ? `${formatTime(span[0])} til ${formatTime(span[1])}` : "Stengt",
    };
  });
}

export function faqFor({ restaurant }: PlacePage) {
  const prices = zones.map((zone) => `${zone.name} ${formatKr(zone.fee)}`).join(", ");
  const hours = openingRows(restaurant)
    .map((row) => `${row.day} ${row.text.toLowerCase()}`)
    .join(", ");
  const faq = [
    {
      q: `Kan jeg få mat fra ${restaurant.name} levert hjem?`,
      a:
        `Ja. KjørNesodden henter bestillingen hos ${restaurant.name} og kjører den hjem til deg på Nesodden. ` +
        (restaurant.orderingMode === "menu"
          ? "Velg retter fra menyen, legg dem i kurven og send bestillingen."
          : "Skriv hva du vil ha, så ringer vi deg og ordner resten."),
    },
    {
      q: "Hva koster levering?",
      a: `Fast pris etter område: ${prices}. Maten betaler du til restaurantens egne priser.`,
    },
    { q: "Hvordan betaler jeg?", a: "Du betaler når maten er levert." },
  ];
  if (hours)
    faq.splice(2, 0, {
      q: `Når kan jeg bestille fra ${restaurant.name}?`,
      a: `Vi tar imot bestillinger når ${restaurant.name} har åpent: ${hours}.`,
    });
  return faq;
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
