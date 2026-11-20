export const NESODDEN_MUNICIPALITY: string;
export const zones: { id: string; name: string; fee: number }[];
export const restaurantPickupAreas: Record<string, string>;
export function deliveryFeeForRoute(pickupAreaId: string | null | undefined, destinationAreaId: string | null | undefined): number | null;
export function deliveryFeeForRestaurants(restaurantIds: string[], destinationAreaId: string | null | undefined): number | null;
export function pickupRestaurantIds(place: string, restaurants: { id: string; name: string; shortName: string }[]): string[];
export function deliveryFeeForPlace(place: string, restaurants: { id: string; name: string; shortName: string }[], destinationAreaId: string | null | undefined): number | null;
export const dayNames: string[];
export function formatTime(minutes: number): string;
export function deliveryZone(
  latitude: number,
  longitude: number,
  postalCode?: string,
  postalPlace?: string,
): { id: string; name: string; fee: number } | null;
export function osloTime(date?: Date): { day: number; minute: number };
export function openingStatus(
  restaurant: {
    hours: ([number, number] | null)[] | null;
    holiday?: { from: string; until: string };
  },
  date?: Date,
): { open: boolean; known: boolean; text: string };
