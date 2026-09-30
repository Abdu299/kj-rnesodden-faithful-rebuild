import type { Address } from "../src/lib/catalog";
export class OrderError extends Error {
  status: number;
  constructor(message: string, status?: number);
}
export function normalizeAddress(raw: Record<string, unknown>): Address | null;
export function searchAddresses(query: string, fetchFn?: typeof fetch): Promise<Address[]>;
export function verifyAddress(
  selection: Pick<Address, "id" | "streetAddress">,
  fetchFn?: typeof fetch,
): Promise<Address>;
export function addressHandler(request: Request, fetchFn?: typeof fetch): Promise<Response>;
