import type { Address } from "../src/lib/catalog";
export function matchTypedAddress(text: string, candidates: Address[]): Address | null;
export function resolveTypedAddress(
  text: string,
  candidates: Address[],
): { address: Address; exact: boolean } | null;
