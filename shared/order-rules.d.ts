export const NESODDEN_MUNICIPALITY: string;
export const zones: { id: string; name: string; fee: number }[];
export const dayNames: string[];
export function formatTime(minutes: number): string;
export function deliveryZone(
  latitude: number,
  longitude: number,
): { id: string; name: string; fee: number } | null;
export function osloTime(date?: Date): { day: number; minute: number };
export function openingStatus(
  restaurant: { hours: ([number, number] | null)[] | null },
  date?: Date,
): { open: boolean; known: boolean; text: string };
