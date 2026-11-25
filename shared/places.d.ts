export type PlaceFaq = { q: string; a: string };
export type PlaceAddress = { street: string; postalCode: string; locality: string; lat: number; lon: number };
export type Place = {
  id: string;
  slug: string;
  address?: PlaceAddress;
  seoName: string;
  dish: string;
  intro: string;
  website: string;
  faq: PlaceFaq[];
};
export const places: Place[];
export function placeBySlug(slug: string): Place | undefined;
export function placeById(id: string): Place | undefined;
export function placePath(place: Place): string;
