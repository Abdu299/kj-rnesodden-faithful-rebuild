export type Place = {
  id: string;
  slug: string;
  seoName: string;
  intro: string;
  website: string;
};
export const places: Place[];
export function placeBySlug(slug: string): Place | undefined;
export function placeById(id: string): Place | undefined;
export function placePath(place: Place): string;
