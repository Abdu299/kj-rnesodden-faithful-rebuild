import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import catalog from "../shared/catalog.json" with { type: "json" };
import { deliveryZone, openingStatus, osloTime } from "../shared/order-rules.js";
import {
  addressHandler,
  normalizeAddress,
  searchAddresses,
  verifyAddress,
} from "../shared/address-service.js";
import { orderHandler, validateMenuOrder } from "../shared/order-service.js";

const signalen = catalog.find((restaurant) => restaurant.id === "signalen");
const openTime = new Date("2026-09-30T16:00:00Z"); // Wednesday, 18:00 in Oslo.
const closedTime = new Date("2026-09-30T18:45:00Z"); // Exactly 20:45 in Oslo.
const addressRecord = {
  kommunenummer: "3212",
  adressekode: 1234,
  nummer: 12,
  bokstav: "",
  adressetekst: "Testveien 12",
  postnummer: "1450",
  poststed: "NESODDTANGEN",
  representasjonspunkt: { lat: 59.8588, lon: 10.6634 },
};
const address = normalizeAddress(addressRecord);
const env = { TELEGRAM_BOT_TOKEN: "test-token", TELEGRAM_CHAT_ID: "test-chat" };
function body(overrides = {}) {
  return {
    kind: "menu",
    requestId: crypto.randomUUID(),
    restaurantId: "signalen",
    items: [
      { itemId: signalen.categories[0].items[0].id, variantId: "0", optionIds: [], quantity: 2 },
    ],
    address: { id: address.id, streetAddress: address.streetAddress },
    fullName: "Test Kunde",
    phone: "400 00 000",
    note: "Ring på døren",
    quotedTotal: 535,
    ...overrides,
  };
}
const request = (payload, options = {}) =>
  new Request("https://example.com/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.com",
      ...options.headers,
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
function mockNetwork({
  records = [addressRecord],
  telegramStatus = 200,
  telegramBody = { ok: true },
  failure = false,
  addressFailure = false,
} = {}) {
  const messages = [];
  const fetchFn = async (url, options) => {
    const parsed = new URL(url);
    if (parsed.hostname === "ws.geonorge.no") {
      assert.equal(parsed.searchParams.get("kommunenummer"), "3212");
      assert.equal(parsed.searchParams.get("utkoordsys"), "4258");
      if (addressFailure) throw new Error("Address provider unavailable");
      return Response.json({ adresser: records });
    }
    assert.equal(parsed.hostname, "api.telegram.org");
    messages.push(JSON.parse(options.body));
    if (failure) throw new Error("Simulated network interruption");
    return Response.json(telegramBody, { status: telegramStatus });
  };
  return { fetchFn, messages };
}
async function send(payload, network = mockNetwork(), overrides = {}) {
  const response = await orderHandler(request(payload), {
    env,
    fetchFn: network.fetchFn,
    now: () => openTime,
    ...overrides,
  });
  return { response, result: await response.json(), messages: network.messages };
}

test("prices match the three delivery areas in the reference", () => {
  assert.equal(deliveryZone(59.8588, 10.6634).fee, 75);
  assert.equal(deliveryZone(59.8209, 10.6278).fee, 100);
  assert.equal(deliveryZone(59.7375, 10.594).fee, 150);
  assert.equal(deliveryZone(NaN, 10), null);
});
test("opening hours use Oslo time, including winter, and close at the exact cutoff", () => {
  assert.deepEqual(osloTime(new Date("2026-09-30T13:45:00Z")), { day: 3, minute: 945 });
  assert.deepEqual(osloTime(new Date("2026-12-30T14:45:00Z")), { day: 3, minute: 945 });
  assert.equal(openingStatus(signalen, new Date("2026-09-30T13:44:59Z")).open, false);
  assert.equal(openingStatus(signalen, new Date("2026-09-30T13:45:00Z")).open, true);
  assert.equal(openingStatus(signalen, new Date("2026-09-30T18:44:59Z")).open, true);
  assert.equal(openingStatus(signalen, closedTime).open, false);
  assert.equal(openingStatus({ hours: null }, openTime).open, false);
  assert.equal(
    openingStatus(
      catalog.find((r) => r.id === "bistro"),
      new Date("2026-09-28T16:00:00Z"),
    ).open,
    false,
  );
});
test("only numbered, geocoded addresses in Nesodden can be selected", () => {
  assert.equal(normalizeAddress({ ...addressRecord, kommunenummer: "0301" }), null);
  assert.equal(normalizeAddress({ ...addressRecord, nummer: 0 }), null);
  assert.equal(normalizeAddress({ ...addressRecord, representasjonspunkt: {} }), null);
  assert.equal(address.label, "Testveien 12, 1450 NESODDTANGEN");
});
test("autocomplete filters non-Nesodden results and duplicates, and skips short queries", async () => {
  const network = mockNetwork({
    records: [addressRecord, addressRecord, { ...addressRecord, kommunenummer: "0301" }],
  });
  assert.equal((await searchAddresses("Testveien", network.fetchFn)).length, 1);
  assert.deepEqual(
    await searchAddresses("Te", () => assert.fail("Short queries must not call the provider")),
    [],
  );
});
test("partial street names use wildcard search, including when a house number is present", async () => {
  const queries = [];
  const fetchFn = async (url) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("kommunenummer"), "3212");
    queries.push(parsed.searchParams.get("sok"));
    return Response.json({ adresser: [addressRecord] });
  };
  for (const query of ["Hasl", "Haslev", " Haslev   11 "])
    assert.equal((await searchAddresses(query, fetchFn)).length, 1);
  assert.deepEqual(queries, ["Hasl*", "Haslev*", "Haslev* 11"]);
});
test("checkout re-fetches the address and ignores client supplied delivery fee and coordinates", async () => {
  const network = mockNetwork({
    records: [{ ...addressRecord, representasjonspunkt: { lat: 59.7375, lon: 10.594 } }],
  });
  const result = await verifyAddress(
    { ...address, zone: { fee: 0 }, latitude: 0, longitude: 0 },
    network.fetchFn,
  );
  assert.equal(result.zone.fee, 150);
  await assert.rejects(() => verifyAddress({ ...address, id: "0301:1234:12:" }, network.fetchFn));
  await assert.rejects(() => verifyAddress({ ...address, id: "3212:9999:12:" }, network.fetchFn));
});
test("address provider failures return a useful 503 response", async () => {
  const response = await addressHandler(
    new Request("https://example.com/api/addresses?q=Testveien"),
    async () => {
      throw new Error("Provider unavailable");
    },
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Adresseoppslaget/);
});
test("server prices include chosen toppings and quantity, never caller supplied prices", () => {
  const option = signalen.categories[0].items[0].options.find((o) => o.id === "glutenfriendly");
  assert.ok(option);
  const payload = body({ quotedTotal: 615 });
  payload.items[0].optionIds = [option.id];
  payload.items[0].unitPrice = 1;
  const order = validateMenuOrder(payload, address, openTime);
  assert.equal(order.subtotal, 540);
  assert.equal(order.total, 615);
  assert.throws(
    () => validateMenuOrder({ ...payload, quotedTotal: 1 }, address, openTime),
    /Prisen er endret/,
  );
});
for (const [label, edit] of [
  [
    "fractional quantity",
    (p) => {
      p.items[0].quantity = 1.5;
    },
  ],
  [
    "zero quantity",
    (p) => {
      p.items[0].quantity = 0;
    },
  ],
  [
    "excessive quantity",
    (p) => {
      p.items[0].quantity = 21;
    },
  ],
  [
    "unknown item",
    (p) => {
      p.items[0].itemId = "unknown";
    },
  ],
  [
    "unknown variant",
    (p) => {
      p.items[0].variantId = "unknown";
    },
  ],
  [
    "unknown topping",
    (p) => {
      p.items[0].optionIds = ["unknown"];
    },
  ],
  [
    "duplicate toppings",
    (p) => {
      p.items[0].optionIds = ["glutenfriendly", "glutenfriendly"];
    },
  ],
  [
    "duplicate cart line",
    (p) => {
      p.items.push({ ...p.items[0] });
    },
  ],
])
  test(`rejects ${label} without sending Telegram`, async () => {
    const payload = body();
    edit(payload);
    const outcome = await send(payload);
    assert.ok([400, 409].includes(outcome.response.status));
    assert.equal(outcome.messages.length, 0);
    assert.equal(outcome.result.success, undefined);
  });
test("a closed restaurant cannot be ordered from through a direct API request", async () => {
  const outcome = await send(body(), mockNetwork(), { now: () => closedTime });
  assert.equal(outcome.response.status, 409);
  assert.equal(outcome.messages.length, 0);
});
test("a restaurant closing during checkout is checked again before sending", async () => {
  let calls = 0;
  const outcome = await send(body(), mockNetwork(), {
    now: () => (calls++ === 0 ? openTime : closedTime),
  });
  assert.equal(outcome.response.status, 409);
  assert.equal(outcome.messages.length, 0);
});
test("unknown menu prices cannot create a priced order", async () => {
  const outcome = await send(body({ restaurantId: "mamagreek" }));
  assert.equal(outcome.response.status, 400);
  assert.equal(outcome.messages.length, 0);
});
test("a successful receipt and Telegram message contain the same canonical total", async () => {
  const outcome = await send(body());
  assert.equal(outcome.response.status, 200);
  assert.equal(outcome.result.success, true);
  assert.equal(outcome.result.receipt.total, 535);
  assert.equal(outcome.messages.length, 1);
  assert.equal(outcome.messages[0].chat_id, "test-chat");
  assert.match(outcome.messages[0].text, /2 × Margherita/);
  assert.match(outcome.messages[0].text, /TOTALT: 535 kr/);
  assert.match(outcome.messages[0].text, /Testveien 12/);
});
test("a typed address submits with canonical goods prices and unconfirmed delivery", async () => {
  const outcome = await send(
    body({
      address: undefined,
      addressText: "Ukjentveien 12, Nesodden",
      quotedTotal: undefined,
    }),
  );
  assert.equal(outcome.response.status, 200);
  assert.equal(outcome.result.receipt.address.label, "Ukjentveien 12, Nesodden");
  assert.equal(outcome.result.receipt.address.verified, false);
  assert.equal(outcome.result.receipt.subtotal, 460);
  assert.equal(outcome.result.receipt.deliveryFee, null);
  assert.equal(outcome.result.receipt.total, null);
  assert.match(outcome.messages[0].text, /2 × Margherita/);
  assert.match(outcome.messages[0].text, /Levering: Fra adressen/);
  assert.match(outcome.messages[0].text, /TOTALT: Bekreftes med kunden/);
});
for (const [label, network, selection] of [
  ["provider outage", { addressFailure: true }, address],
  ["unrecognized address", { records: [] }, address],
  ["address outside Nesodden", {}, { ...address, id: "0301:1234:12:", zone: { fee: 0 } }],
])
  test(`${label} keeps the request and marks delivery for confirmation`, async () => {
    const outcome = await send(
      body({ address: selection, addressText: "Min adresse 12" }),
      mockNetwork(network),
    );
    assert.equal(outcome.response.status, 200);
    assert.equal(outcome.result.receipt.address.label, "Min adresse 12");
    assert.equal(outcome.result.receipt.deliveryFee, null);
    assert.equal(outcome.result.receipt.total, null);
    assert.equal(outcome.messages.length, 1);
    assert.match(outcome.messages[0].text, /Min adresse 12/);
    assert.match(outcome.messages[0].text, /Levering: Fra adressen/);
  });
test("an empty address still requires the customer to enter an address", async () => {
  const outcome = await send(body({ address: undefined, addressText: "   " }));
  assert.equal(outcome.response.status, 400);
  assert.equal(outcome.messages.length, 0);
});
test("retries and concurrent submissions with the same request ID send once", async () => {
  const payload = body();
  const network = mockNetwork();
  const results = await Promise.all([send(payload, network), send(payload, network)]);
  assert.ok(results.every((r) => r.result.success));
  assert.equal(network.messages.length, 1);
  const retry = await send(payload, network);
  assert.equal(retry.result.receipt.reference, results[0].result.receipt.reference);
  const changed = await send({ ...payload, note: "Changed request" }, network);
  assert.equal(changed.response.status, 409);
  assert.equal(network.messages.length, 1);
});
for (const [label, settings] of [
  ["HTTP error", { telegramStatus: 502, telegramBody: { ok: false } }],
  ["Telegram ok=false", { telegramBody: { ok: false } }],
  ["network interruption", { failure: true }],
])
  test(`${label} never produces a success receipt`, async () => {
    const outcome = await send(body(), mockNetwork(settings));
    assert.equal(outcome.response.status, 502);
    assert.equal(outcome.result.success, undefined);
  });
test("Noe annet sends an inquiry with a known delivery fee and unconfirmed goods total", async () => {
  const outcome = await send(
    body({
      kind: "request",
      restaurantId: undefined,
      type: "Dagligvarer",
      place: "Kiwi Tangen",
      description: "2 liter melk",
    }),
  );
  assert.equal(outcome.result.receipt.total, null);
  assert.equal(outcome.result.receipt.deliveryFee, 75);
  assert.match(outcome.messages[0].text, /endelig total må bekreftes/);
});
test("Noe annet can submit a typed address without a selected suggestion", async () => {
  const outcome = await send(
    body({
      kind: "request",
      restaurantId: undefined,
      type: "Dagligvarer",
      place: "Kiwi Tangen",
      description: "2 liter melk",
      address: undefined,
      addressText: "Ny gate 7",
    }),
  );
  assert.equal(outcome.response.status, 200);
  assert.equal(outcome.result.receipt.deliveryFee, null);
  assert.match(outcome.messages[0].text, /Ny gate 7/);
  assert.match(outcome.messages[0].text, /Levering: Fra adressen/);
});
test("the legacy free-text API also survives an address provider outage", async () => {
  const outcome = await send(
    {
      fullName: "Test Kunde",
      phone: "40000000",
      deliveryAddress: "Ukjent gate 7",
      deliveryType: "Dagligvarer",
      deliveryPlace: "Kiwi Tangen",
      description: "Melk",
    },
    mockNetwork({ addressFailure: true }),
  );
  assert.equal(outcome.response.status, 200);
  assert.equal(outcome.result.receipt.deliveryFee, null);
  assert.match(outcome.messages[0].text, /Ukjent gate 7/);
});
test("O' Sole Mio and Mama Greek use the supplied hours on every day of the week", () => {
  const sole = catalog.find((r) => r.id === "osolemio");
  const mama = catalog.find((r) => r.id === "mamagreek");
  for (let offset = 0; offset < 7; offset++) {
    const base = new Date(new Date("2026-09-27T00:00:00Z").getTime() + offset * 86400000);
    const start = offset <= 2 ? 900 : 930;
    const end = offset <= 2 ? 1260 : 1290;
    assert.deepEqual(sole.hours[offset], [start, end]);
    assert.deepEqual(mama.hours[offset], [660, 1200]);
    for (const [r, opening, closing] of [
      [sole, start, end],
      [mama, 660, 1200],
    ]) {
      const at = (minute) => new Date(base.getTime() + (minute - 120) * 60000);
      assert.equal(openingStatus(r, at(opening - 1)).open, false);
      assert.equal(openingStatus(r, at(opening)).open, true);
      assert.equal(openingStatus(r, at(closing - 1)).open, true);
      assert.equal(openingStatus(r, at(closing)).open, false);
    }
  }
});
for (const [restaurantId, place, closing] of [
  ["osolemio", "O' Sole Mio", "2026-09-30T19:30:00Z"],
  ["mamagreek", "Mama Greek Kitchen", "2026-09-30T18:00:00Z"],
])
  test(`${place} accepts requests while open and rejects closed requests even with an unknown address`, async () => {
    const payload = body({
      kind: "request",
      restaurantId,
      place,
      type: "Restaurant",
      description: "Mat",
      address: undefined,
      addressText: "Ukjent gate 7",
    });
    const open = await send(payload);
    assert.equal(open.response.status, 200);
    const closedPayload = { ...payload, requestId: crypto.randomUUID() };
    const closed = await send(closedPayload, mockNetwork(), { now: () => new Date(closing) });
    assert.equal(closed.response.status, 409);
    assert.equal(closed.messages.length, 0);
    const freeText = await send(
      { ...closedPayload, restaurantId: undefined, requestId: crypto.randomUUID() },
      mockNetwork(),
      { now: () => new Date(closing) },
    );
    assert.equal(freeText.response.status, 409);
    assert.equal(freeText.messages.length, 0);
    let calls = 0;
    const closingDuringSend = await send(
      { ...payload, requestId: crypto.randomUUID() },
      mockNetwork(),
      {
        now: () => (calls++ === 0 ? openTime : new Date(closing)),
      },
    );
    assert.equal(closingDuringSend.response.status, 409);
    assert.equal(closingDuringSend.messages.length, 0);
  });
test("an inquiry cannot bypass a known restaurant's closing time", async () => {
  const outcome = await send(
    body({
      kind: "request",
      restaurantId: undefined,
      type: "Restaurant",
      place: "Signalen Sjøbad – Trattoria al Mare",
      description: "Pizza",
    }),
    mockNetwork(),
    { now: () => closedTime },
  );
  assert.equal(outcome.response.status, 409);
  assert.equal(outcome.messages.length, 0);
});
test("the existing mobile app's free-text API remains usable during opening hours", async () => {
  const payload = {
    fullName: "Test Kunde",
    phone: "40000000",
    deliveryAddress: "Testveien 12, 1450 NESODDTANGEN",
    deliveryType: "Restauranter",
    deliveryPlace: "Signalen Sjøbad – Trattoria al Mare",
    description: "Margherita",
  };
  const outcome = await send(payload);
  assert.equal(outcome.response.status, 200);
  assert.equal(outcome.result.receipt.total, null);
  const closed = await send(payload, mockNetwork(), { now: () => closedTime });
  assert.equal(closed.response.status, 409);
});
test("missing credentials, malformed bodies, invalid phones and foreign origins cannot send", async () => {
  const network = mockNetwork();
  assert.equal((await send(body(), network, { env: {} })).response.status, 503);
  assert.equal((await send("{", network)).response.status, 400);
  assert.equal((await send(body({ phone: "abc" }), network)).response.status, 400);
  assert.equal(
    (
      await orderHandler(request(body(), { headers: { Origin: "https://foreign.example" } }), {
        env,
        fetchFn: network.fetchFn,
      })
    ).status,
    403,
  );
  const options = await orderHandler(
    new Request("https://example.com/api/send", {
      method: "OPTIONS",
      headers: { Origin: "https://example.com" },
    }),
    { env: {} },
  );
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("Access-Control-Allow-Origin"), "https://example.com");
  assert.equal(network.messages.length, 0);
});
test("all recognized restaurants in a legacy multi-place inquiry must be open", async () => {
  const payload = {
    fullName: "Test Kunde",
    phone: "40000000",
    deliveryAddress: "Testveien 12",
    deliveryType: "Restauranter",
    deliveryPlace: "JAFS Nesodden, Signalen Sjøbad",
    description: "Mat fra begge steder",
  };
  const outcome = await send(payload, mockNetwork(), {
    now: () => new Date("2026-09-30T19:00:00Z"),
  });
  assert.equal(outcome.response.status, 409);
  assert.equal(outcome.messages.length, 0);
});
test("every menu has unique IDs, finite prices and existing local image files", () => {
  assert.equal(catalog[0].id, "signalen");
  assert.ok(catalog.some((r) => r.id === "bistro"));
  assert.equal(
    catalog.some((r) => /Flasken Kjøkken/.test(r.name)),
    false,
  );
  for (const r of catalog) {
    assert.ok(existsSync(new URL(`../public${r.image}`, import.meta.url)), r.image);
    const items = r.categories.flatMap((c) => c.items);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length, r.id);
    for (const item of items) {
      for (const price of [...item.variants, ...item.options])
        assert.ok(Number.isInteger(price.price) && price.price >= 0, `${r.id}: ${item.name}`);
      if (item.image)
        assert.ok(existsSync(new URL(`../public${item.image}`, import.meta.url)), item.image);
    }
  }
});
