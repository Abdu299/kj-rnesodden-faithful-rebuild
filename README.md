# KjørNesodden

Restaurant menus, grocery inquiries and address-based delivery ordering for Nesodden. The orange/navy layout follows the supplied restaurant website, with Signalen first and **Noe annet?** as its own card. Mobile checkout uses a fixed cart button and a scrollable cart sheet.

## Development

Use Node.js 24 or later and npm:

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

TanStack Start handles the pages and API routes. Nitro builds the Vercel deployment. Both the TanStack `/api/send` route and the standalone Vercel adapter use `shared/order-service.js`.

See [Telegram and Vercel setup](TELEGRAM-VERCEL-SETUP.md) for server credentials and deployment checks.

## Menus and ordering hours

All prices, variants, images, allergens, sources and weekly hours are in `shared/catalog.json`. Hours are minutes after midnight, in Sunday-through-Saturday order. They are interpreted in **Europe/Oslo**, regardless of the visitor's device time zone. Opening time is inclusive; closing time is exclusive. The UI disables ordering outside these hours, and the server checks again immediately before sending.

Sources checked on 30 September 2026:

| Restaurant            | Menu source                                                                                    | Ordering hours                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Signalen Sjøbad       | Supplied KjørNesodden PDF for pizza, prices and takeaway hours; OrderX for drinks and toppings | Special takeaway hours from the supplied PDF                     |
| Tonys Sushi og Thai   | Restaurant's official menu                                                                     | Official daily hours                                             |
| JAFS Nesodden         | Official July 2026 takeaway PDF                                                                | Official restaurant hours                                        |
| Pizzabakeren Nesodden | Official menu PDF                                                                              | Reference site's takeaway cutoff, before the restaurant closes   |
| Jonathan Sushi        | Restaurant’s own Nesodden takeaway menu on Munu                                                | Reference site's takeaway cutoff, before the restaurant closes   |
| Flaskebekk Bistro     | Two supplied 2026 menu images, including drinks and hours                                      | Printed hours; Monday closed                                     |
| O' Sole Mio           | Official Facebook linked; current prices could not be verified                                 | Inquiry only; availability and price confirmed before purchasing |
| Mama Greek Kitchen    | Current menu and hours could not be verified                                                   | Inquiry only; availability and price confirmed before purchasing |

The two inquiry-only restaurants also use that mode in the supplied example. Their unavailable prices are never treated as zero or included in a fabricated total. Mama Greek uses a clearly described food illustration until an actual restaurant photo is supplied. Bistro's card uses the restaurant image from the supplied menu.

Update `verifiedAt`, sources and menu entries together when prices change. Uploaded original menus are linked under `public/menus`. Do not add alcohol without implementing the business's age and delivery requirements. Published allergens only reflect the source menu and do not establish that a dish is safe for a particular allergy.

## Address and delivery price

`GET /api/addresses?q=...` queries Kartverket's official [Geonorge address API](https://ws.geonorge.no/adresser/v1/) with municipality **3212** (Nesodden). Only numbered, geocoded Nesodden street addresses are returned. Editing a selected address clears its verification and fee until the user selects a suggestion again.

The server looks up the selected address again at checkout. It derives the delivery zone from those coordinates, ignores caller-supplied coordinates and fees, rebuilds product prices from the catalog, and checks the quoted total.

Delivery prices are 75 kr for Tangen/Bjørnemyr/Helvik, 100 kr for Alværn/Fjordvangen/Fjellstrand, and 150 kr for Fagerstrand. The nearest geographic anchors in `shared/order-rules.js` reproduce the example site's business zones; they are not official municipal or postcode boundaries. Change those anchors if the business changes its delivery areas.

## Telegram submission

Only the server reads the bot token and chat ID. An order is confirmed only after Telegram responds with HTTP success **and** `ok: true`. Network failures keep the cart and show an error. The Telegram message and on-screen receipt share the server-calculated items, options, delivery fee and final total.

The browser assigns an ID to a submission and reuses it for an unchanged retry. In-flight and recent submissions are deduplicated within a server instance for 15 minutes. This is best-effort across Vercel instances; it is not a durable order database. If a connection is interrupted after Telegram accepts a message, the customer is told to call before resubmitting.

The previous mobile app's `deliveryType`, `deliveryPlace`, `deliveryAddress` and free-text `description` payload is accepted as an **unpriced inquiry**. A full Nesodden street address is required, and recognized restaurants still respect closing hours. Native requests without an Origin header work; browser access from another first-party app can be configured with `ORDER_ALLOWED_ORIGINS`.

Customer details remain in memory in the browser. Only cart item IDs and quantities are saved locally. The service does not log customer details or Telegram credentials. The existing app-related privacy and account deletion pages remain available.

## Verification

The Node test suite mocks the address provider and Telegram, so it does not submit real orders. It covers geographic fees, Oslo opening/closing boundaries, tampered prices and options, address revalidation, unsupported menus, inquiry totals, legacy payloads, duplicate submissions, Telegram failures, CORS, and missing credentials. Menu integrity checks verify unique IDs and existing image assets.
