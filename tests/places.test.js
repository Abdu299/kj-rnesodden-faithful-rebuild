import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import catalog from "../shared/catalog.json" with { type: "json" };
import { places, placeBySlug, placePath } from "../shared/places.js";

const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");

test("every restaurant in the catalog has its own page", () => {
  for (const restaurant of catalog) {
    assert.ok(
      places.some((place) => place.id === restaurant.id),
      `${restaurant.id} mangler i shared/places.js`,
    );
  }
  for (const place of places) {
    assert.ok(
      catalog.some((restaurant) => restaurant.id === place.id),
      `${place.id} finnes ikke i catalog.json`,
    );
  }
});

test("slugs are unique, lowercase and url safe", () => {
  assert.equal(new Set(places.map((place) => place.slug)).size, places.length);
  for (const place of places) {
    assert.match(place.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, place.slug);
    assert.equal(placeBySlug(place.slug), place);
  }
});

test("page texts are filled in and have no dashes used as punctuation", () => {
  for (const place of places) {
    assert.ok(place.seoName.length > 3, place.id);
    assert.ok(place.intro.length > 60, place.id);
    assert.equal(/[–—]/.test(place.intro + place.seoName), false, place.id);
  }
});

test("every place has its own questions, not only the shared ones", () => {
  for (const place of places) {
    assert.ok(place.faq.length >= 1, place.id);
    for (const item of place.faq) assert.equal(/[–—]/.test(item.q + item.a), false, place.id);
  }
});

test("titles stay within what Google shows", () => {
  for (const place of places) {
    const restaurant = catalog.find((r) => r.id === place.id);
    const what = restaurant.orderingMode === "menu" ? "Meny og levering" : "Bestill levering";
    const title = `${place.seoName} | ${what} | KjørNesodden`;
    assert.ok(title.length <= 64, `${title} (${title.length})`);
  }
});

test("sitemap lists the overview and every place page", () => {
  assert.equal(sitemap.includes("<loc>https://www.kjornesodden.no/restauranter</loc>"), false);
  for (const place of places) {
    assert.ok(
      sitemap.includes(`<loc>https://www.kjornesodden.no${placePath(place)}</loc>`),
      `${placePath(place)} mangler i sitemap.xml`,
    );
  }
});
