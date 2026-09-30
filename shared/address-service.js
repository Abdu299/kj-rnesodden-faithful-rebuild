import { NESODDEN_MUNICIPALITY, deliveryZone } from "./order-rules.js";

const API = "https://ws.geonorge.no/adresser/v1/sok";
export class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
export function normalizeAddress(raw) {
  if (String(raw.kommunenummer) !== NESODDEN_MUNICIPALITY || !raw.nummer) return null;
  const latitude = raw.representasjonspunkt?.lat;
  const longitude = raw.representasjonspunkt?.lon;
  const zone = deliveryZone(latitude, longitude);
  if (!zone) return null;
  const streetAddress = raw.adressetekstutenadressetilleggsnavn || raw.adressetekst;
  if (!streetAddress || !raw.postnummer || !raw.poststed || !raw.adressekode) return null;
  return {
    id: `${raw.kommunenummer}:${raw.adressekode}:${raw.nummer}:${raw.bokstav || ""}`,
    streetAddress,
    postalCode: raw.postnummer,
    postalPlace: raw.poststed,
    municipality: NESODDEN_MUNICIPALITY,
    latitude,
    longitude,
    label: `${streetAddress}, ${raw.postnummer} ${raw.poststed}`,
    zone,
  };
}
async function lookup(query, fetchFn, count = 8) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    kommunenummer: NESODDEN_MUNICIPALITY,
    sok: query,
    treffPerSide: String(count),
    utkoordsys: "4258",
  }).toString();
  try {
    const response = await fetchFn(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Address lookup failed");
    const result = await response.json();
    if (!Array.isArray(result.adresser)) throw new Error("Invalid address response");
    return result.adresser.map(normalizeAddress).filter(Boolean);
  } catch {
    throw new OrderError(
      "Adresseoppslaget er midlertidig utilgjengelig. Prøv igjen, eller ring 934 61 991.",
      503,
    );
  }
}
export async function searchAddresses(query, fetchFn = fetch) {
  if (typeof query !== "string" || query.length > 120) throw new OrderError("Ugyldig adressesøk.");
  if (query.trim().length < 3) return [];
  const matches = await lookup(query.trim(), fetchFn);
  return [...new Map(matches.map((address) => [address.id, address])).values()];
}
export async function verifyAddress(selection, fetchFn = fetch) {
  if (
    !selection ||
    typeof selection.id !== "string" ||
    !/^3212:\d+:\d+:[A-Za-zÆØÅæøå]?$/.test(selection.id) ||
    typeof selection.streetAddress !== "string" ||
    selection.streetAddress.length > 150
  ) {
    throw new OrderError("Velg en adresse på Nesodden fra forslagene.");
  }
  const matches = await lookup(selection.streetAddress, fetchFn, 100);
  const address = matches.find((candidate) => candidate.id === selection.id);
  if (!address)
    throw new OrderError(
      "Adressen kunne ikke bekreftes i Nesodden kommune. Velg den på nytt fra forslagene.",
    );
  return address;
}
export async function addressHandler(request, fetchFn = fetch) {
  if (request.method !== "GET")
    return Response.json(
      { error: "Kun GET er tillatt." },
      { status: 405, headers: { Allow: "GET" } },
    );
  try {
    const query = new URL(request.url).searchParams.get("q") || "";
    return Response.json(
      { addresses: await searchAddresses(query, fetchFn) },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof OrderError ? error.message : "Adresseoppslaget feilet." },
      { status: error instanceof OrderError ? error.status : 500 },
    );
  }
}
