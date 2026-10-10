export type PlaceFaq = { q: string; a: string };
export type Place = {
  id: string;
  slug: string;
  seoName: string;
  intro: string;
  website: string;
  faq: PlaceFaq[];
};
export const places: Place[];
export function placeBySlug(slug: string): Place | undefined;
export function placeById(id: string): Place | undefined;
export function placePath(place: Place): string;
