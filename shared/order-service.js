import catalog from "./catalog.json" with { type: "json" };
import { OrderError, verifyAddress, searchAddresses } from "./address-service.js";
import { openingStatus } from "./order-rules.js";

const inFlight = new Map();
const recent = new Map();
const money = (amount) => `${amount.toLocaleString("nb-NO")} kr`;
function textField(value, name, max, required = true) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim()))
    throw new OrderError(`Kontroller feltet «${name}».`);
  return value.trim();
}
export function validateCustomer(body) {
  const fullName = textField(body.fullName, "Navn", 120);
  const phone = textField(body.phone, "Telefonnummer", 30).replace(/[\s()-]/g, "");
  if (!/^\+?\d{8,15}$/.test(phone)) throw new OrderError("Fyll inn et gyldig telefonnummer.");
  const note = textField(body.note ?? "", "Beskjed", 800, false);
  if (body.website) throw new OrderError("Bestillingen kunne ikke sendes.");
  return { fullName, phone, note };
}
export function validateMenuOrder(body, address, now = new Date()) {
  const restaurant = catalog.find((r) => r.id === body.restaurantId);
  if (!restaurant || restaurant.orderingMode !== "menu")
    throw new OrderError("Velg en restaurant med tilgjengelig meny.");
  const status = openingStatus(restaurant, now);
  if (!status.open)
    throw new OrderError(`${restaurant.name} tar ikke imot bestillinger nå. ${status.text}.`, 409);
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30)
    throw new OrderError("Kurven må inneholde mellom 1 og 30 ulike varelinjer.");
  const availableItems = restaurant.categories.flatMap((category) => category.items);
  const keys = new Set();
  const lines = body.items.map((line) => {
    if (!line || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20)
      throw new OrderError("Antall må være mellom 1 og 20 per vare.");
    const item = availableItems.find((product) => product.id === line.itemId);
    const variant = item?.variants.find((choice) => choice.id === line.variantId);
    if (!item || !variant)
      throw new OrderError("En vare er endret eller finnes ikke i menyen. Oppdater kurven.", 409);
    const ids = line.optionIds ?? [];
    if (!Array.isArray(ids) || ids.length > item.options.length || new Set(ids).size !== ids.length)
      throw new OrderError("Ugyldige tilvalg.");
    const options = ids.map((id) => {
      const option = item.options.find((choice) => choice.id === id);
      if (!option) throw new OrderError("Et tilvalg finnes ikke i menyen.");
      return option;
    });
    const key = `${item.id}:${variant.id}:${[...ids].sort().join(",")}`;
    if (keys.has(key))
      throw new OrderError("Samme vare er oppgitt flere ganger. Endre antallet i kurven.");
    keys.add(key);
    const unitPrice = variant.price + options.reduce((sum, option) => sum + option.price, 0);
    return {
      name: `${item.number ? `${item.number}. ` : ""}${item.name}`,
      variant: variant.label,
      options: options.map((option) => option.label),
      quantity: line.quantity,
      unitPrice,
      lineTotal: unitPrice * line.quantity,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const deliveryFee = address.zone?.fee ?? null;
  const total = deliveryFee === null ? null : subtotal + deliveryFee;
  if (total !== null && body.quotedTotal !== undefined && body.quotedTotal !== total)
    throw new OrderError(
      "Prisen er endret. Velg adressen på nytt og kontroller totalen før du sender.",
      409,
    );
  return {
    kind: "menu",
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    address,
    lines,
    subtotal,
    deliveryFee,
    total,
  };
}
function validateRequest(body, address, now, legacy = false) {
  const restaurant = body.restaurantId ? catalog.find((r) => r.id === body.restaurantId) : null;
  if (body.restaurantId && !restaurant) throw new OrderError("Ukjent restaurant.");
  if (restaurant?.orderingMode === "menu" && !legacy)
    throw new OrderError("Bruk restaurantens meny for å bestille.");
  const type = textField(body.type, "Type", 80);
  if (
    !["Dagligvarer", "McDonald's / Burger King", "Restaurant", "Annet", "Restauranter"].includes(
      type,
    )
  )
    throw new OrderError("Velg en gyldig bestillingstype.");
  const place = restaurant?.name ?? textField(body.place, "Sted", 180);
  const fold = (value) =>
    value
      .toLocaleLowerCase("nb-NO")
      .replace(/[’']/g, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const normalizedPlace = ` ${fold(place).replace(/[(),;\/–—-]/g, " ")} `;
  const knownPlaces = catalog.filter((r) =>
    [r.name, r.shortName].some((name) => normalizedPlace.includes(` ${fold(name)} `)),
  );
  if (restaurant && !knownPlaces.some((place) => place.id === restaurant.id))
    knownPlaces.push(restaurant);
  if (knownPlaces.length) {
    const closed = knownPlaces.find((place) => place.hours && !openingStatus(place, now).open);
    if (closed) throw new OrderError(`${closed.name} tar ikke imot bestillinger nå.`, 409);
    if (!legacy && knownPlaces.some((place) => place.orderingMode === "menu"))
      throw new OrderError("Bruk restaurantens meny for å bestille.");
  }
  const description = textField(body.description, "Hva du vil kjøpe", 1800);
  return {
    kind: "request",
    restaurantId: restaurant?.id ?? knownPlaces[0]?.id ?? null,
    checkedRestaurantIds: knownPlaces.map((place) => place.id),
    restaurantName: place,
    type,
    description,
    address,
    lines: [],
    subtotal: null,
    deliveryFee: address.zone?.fee ?? null,
    total: null,
  };
}
export function formatTelegramOrder(order) {
  const parts = [
    order.kind === "menu" ? "🛒 NY BESTILLING – KjørNesodden" : "📝 NY FORESPØRSEL – KjørNesodden",
    `Referanse: ${order.reference}`,
    "",
    `👤 Navn: ${order.fullName}`,
    `📞 Telefon: ${order.phone}`,
    `📍 Leveringsadresse: ${order.address.label}`,
    order.address.zone
      ? `Leveringsområde: ${order.address.zone.name}`
      : "Adresse og leveringsområde må bekreftes med kunden.",
    "",
    `🏪 ${order.kind === "menu" ? "Restaurant" : "Hentested"}: ${order.restaurantName}`,
    "",
  ];
  if (order.kind === "menu") {
    parts.push("🍽 Bestilling:");
    for (const line of order.lines) {
      parts.push(
        `${line.quantity} × ${line.name}${line.variant ? ` (${line.variant})` : ""} – ${money(line.lineTotal)}`,
      );
      if (line.options.length) parts.push(`   Tilvalg: ${line.options.join(", ")}`);
    }
    parts.push(
      "",
      `Varer: ${money(order.subtotal)}`,
      `Levering: ${order.deliveryFee === null ? "Fra adressen – bekreftes med kunden" : money(order.deliveryFee)}`,
      `TOTALT: ${order.total === null ? "Bekreftes med kunden" : money(order.total)}`,
    );
  } else
    parts.push(
      `Type: ${order.type}`,
      order.description,
      "",
      `Levering: ${order.deliveryFee === null ? "Fra adressen – bekreftes med kunden" : money(order.deliveryFee)}`,
      "Varepris og endelig total må bekreftes med kunden før innkjøp.",
    );
  if (order.note) parts.push("", `Beskjed: ${order.note}`);
  parts.push(
    "",
    "Betaling ved levering.",
    `Mottatt: ${new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}`,
  );
  const message = parts.join("\n");
  if (message.length > 4096)
    throw new OrderError("Bestillingen er for lang. Forkort beskjeden eller ring 934 61 991.");
  return message;
}
function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  const allowed = [
    new URL(request.url).origin,
    ...(env.ORDER_ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ];
  if (!allowed.includes(origin))
    throw new OrderError("Denne nettsiden har ikke tilgang til bestillingsendepunktet.", 403);
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
export async function orderHandler(request, dependencies = {}) {
  const env = dependencies.env ?? process.env;
  const fetchFn = dependencies.fetchFn ?? fetch;
  const now = dependencies.now ?? (() => new Date());
  let headers = { "Cache-Control": "no-store" };
  try {
    headers = { ...headers, ...corsHeaders(request, env) };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return Response.json(
        { error: "Kun POST er tillatt." },
        { status: 405, headers: { ...headers, Allow: "POST, OPTIONS" } },
      );
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID)
      throw new OrderError("Bestilling er midlertidig utilgjengelig. Ring 934 61 991.", 503);
    if (Number(request.headers.get("Content-Length")) > 24000)
      throw new OrderError("Bestillingen er for stor.", 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 24000)
      throw new OrderError("Bestillingen er for stor.", 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new OrderError("Ugyldig bestilling.");
    }
    if (!body || Array.isArray(body) || typeof body !== "object")
      throw new OrderError("Ugyldig bestilling.");
    const legacy = body.kind === undefined && body.deliveryType && body.deliveryPlace;
    if (legacy)
      body = { ...body, kind: "request", type: body.deliveryType, place: body.deliveryPlace };
    if (body.kind !== "menu" && body.kind !== "request")
      throw new OrderError("Ugyldig bestillingstype.");
    const customer = validateCustomer(body);
    const requestId = legacy ? crypto.randomUUID() : body.requestId;
    if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId))
      throw new OrderError("Last siden på nytt og prøv igjen.");
    const fingerprint = JSON.stringify(body);
    for (const [key, value] of recent) if (value.expires < Date.now()) recent.delete(key);
    const previous = recent.get(requestId) || inFlight.get(requestId);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        throw new OrderError("Bestillingen er endret. Prøv igjen.", 409);
      return Response.json(previous.result ?? (await previous.promise), { headers });
    }
    const promise = (async () => {
      const addressText = textField(
        body.addressText ?? body.deliveryAddress ?? body.address?.streetAddress,
        "Adresse",
        250,
      );
      let address = {
        label: addressText,
        streetAddress: addressText,
        verified: false,
        zone: null,
      };
      if (legacy && !body.address) {
        try {
          const street = addressText.split(",")[0].trim().toLocaleLowerCase("nb-NO");
          const matches = await searchAddresses(street, fetchFn);
          address =
            matches.find(
              (candidate) => candidate.streetAddress.toLocaleLowerCase("nb-NO") === street,
            ) ?? address;
        } catch (error) {
          if (!(error instanceof OrderError)) throw error;
        }
      } else if (body.address) {
        try {
          address = await verifyAddress(body.address, fetchFn);
        } catch (error) {
          // Never drop an order because the address provider fails or cannot
          // recognize it. The typed address goes to Telegram for confirmation.
          if (!(error instanceof OrderError)) throw error;
        }
      }
      const validated =
        body.kind === "menu"
          ? validateMenuOrder(body, address, now())
          : validateRequest(body, address, now(), legacy);
      const order = {
        ...validated,
        ...customer,
        reference: `KN-${requestId.slice(0, 8).toUpperCase()}`,
        createdAt: now().toISOString(),
      };
      const message = formatTelegramOrder(order);
      const orderedRestaurants = (order.checkedRestaurantIds ?? [order.restaurantId])
        .map((id) => catalog.find((r) => r.id === id))
        .filter((restaurant) => restaurant?.hours);
      if (orderedRestaurants.some((restaurant) => !openingStatus(restaurant, now()).open))
        throw new OrderError("Restauranten stengte før bestillingen kunne sendes.", 409);
      let response;
      try {
        response = await fetchFn(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text: message,
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(12000),
          },
        );
      } catch {
        throw new OrderError(
          "Vi kunne ikke bekrefte at bestillingen ble sendt. Ring 934 61 991 og oppgi referansen før du prøver igjen.",
          502,
        );
      }
      let telegram;
      try {
        telegram = await response.json();
      } catch {
        throw new OrderError("Bestillingen kunne ikke bekreftes. Ring 934 61 991.", 502);
      }
      if (!response.ok || telegram.ok !== true)
        throw new OrderError(
          "Bestillingen ble ikke sendt. Prøv igjen, eller ring 934 61 991.",
          502,
        );
      const result = { success: true, receipt: order };
      recent.set(requestId, { fingerprint, result, expires: Date.now() + 15 * 60 * 1000 });
      return result;
    })();
    inFlight.set(requestId, { fingerprint, promise });
    try {
      return Response.json(await promise, { headers });
    } finally {
      inFlight.delete(requestId);
    }
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof OrderError
            ? error.message
            : "Bestillingen kunne ikke sendes. Ring 934 61 991.",
      },
      { status: error instanceof OrderError ? error.status : 500, headers },
    );
  }
}
