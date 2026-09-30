import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/addresses.js";

function responseRecorder() {
  return {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(value) {
      this.statusCode = value;
      return this;
    },
    send(value) {
      this.body = JSON.parse(value);
      return this;
    },
  };
}

const record = {
  kommunenummer: "3212",
  adressekode: 1234,
  nummer: 12,
  adressetekst: "Testveien 12",
  postnummer: "1450",
  poststed: "NESODDTANGEN",
  representasjonspunkt: { lat: 59.8588, lon: 10.6634 },
};

test("Vercel GET adapter preserves the query and serves only Nesodden addresses", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const lookup = new URL(url);
    assert.equal(lookup.searchParams.get("sok"), "Testveien");
    assert.equal(lookup.searchParams.get("kommunenummer"), "3212");
    return Response.json({ adresser: [record, { ...record, kommunenummer: "0301" }] });
  };
  try {
    const res = responseRecorder();
    await handler(
      { method: "GET", url: "/api/addresses?q=Testveien", headers: { host: "example.com" } },
      res,
    );
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.addresses.length, 1);
    assert.equal(res.body.addresses[0].municipality, "3212");
    assert.equal(res.body.addresses[0].zone.fee, 75);
    assert.equal(res.headers["cache-control"], "public, max-age=300");
    assert.match(res.headers["content-type"], /application\/json/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Vercel address adapter rejects POST and preserves the Allow header", async () => {
  const res = responseRecorder();
  await handler(
    { method: "POST", url: "/api/addresses?q=Testveien", headers: { host: "example.com" } },
    res,
  );
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, "GET");
});

test("Vercel address adapter preserves provider failures as JSON with status 503", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Provider unavailable");
  };
  try {
    const res = responseRecorder();
    await handler(
      { method: "GET", url: "/api/addresses?q=Testveien", headers: { host: "example.com" } },
      res,
    );
    assert.equal(res.statusCode, 503);
    assert.match(res.body.error, /midlertidig utilgjengelig/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
