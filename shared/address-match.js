// Matches the address a customer typed by hand against address suggestions.
// Deliberately strict: only one unambiguous match is accepted, so a nearby or
// partial address can never set the delivery price by accident.
const fold = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("nb-NO")
    .replace(/[.,;]/g, " ")
    // "Kapellveien 84 B" and "Kapellveien 84B" are the same address.
    .replace(/(\d)\s+([a-zæøå])(?![a-zæøå0-9])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();

function isSameAddress(typed, address) {
  const street = fold(address.streetAddress);
  if (!street || !(typed === street || typed.startsWith(`${street} `))) return false;
  const rest = typed.slice(street.length).trim();
  if (!rest) return true;
  // After the street and number, only this address's own postcode and place
  // may follow. Anything else means the customer wrote something we cannot verify.
  const allowed = [fold(address.postalCode), ...fold(address.postalPlace).split(" "), "nesodden"];
  return rest.split(" ").every((word) => allowed.includes(word));
}

/** The single suggestion that is exactly what the customer typed, or null. */
export function matchTypedAddress(text, candidates) {
  const typed = fold(text);
  if (typed.length < 3 || !Array.isArray(candidates)) return null;
  const hits = candidates.filter((address) => address && isSameAddress(typed, address));
  return hits.length === 1 ? hits[0] : null;
}

/**
 * Server-side resolution. `exact` is true when the whole text is the address.
 * Otherwise the part before the first comma must be the address ("Testveien 12,
 * leilighet 3"), and a different postcode later in the text cancels the match.
 */
export function resolveTypedAddress(text, candidates) {
  const whole = matchTypedAddress(text, candidates);
  if (whole) return { address: whole, exact: true };
  const value = String(text ?? "");
  const comma = value.indexOf(",");
  if (comma < 0) return null;
  const address = matchTypedAddress(value.slice(0, comma), candidates);
  if (!address) return null;
  const postcodes = value.slice(comma + 1).match(/\b\d{4}\b/g) ?? [];
  return postcodes.every((code) => code === address.postalCode) ? { address, exact: false } : null;
}
