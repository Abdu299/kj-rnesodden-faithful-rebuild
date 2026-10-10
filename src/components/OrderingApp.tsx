import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Reviews, ReviewsBadge } from "./Reviews";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  restaurantById,
  restaurants,
  formatKr,
  describeLine,
  lineKey,
  type Address,
  type CartLine,
  type MenuItem,
  type Receipt,
  type Restaurant,
} from "../lib/catalog";
import { dayNames, formatTime, openingStatus, zones } from "../../shared/order-rules.js";
import { CartPanel, RequestForm, ReceiptPage } from "./Checkout";
import { placeById } from "../../shared/places.js";
import { Crumbs } from "./Crumbs";
import { Credit } from "./Credit";
import { SiteHeader } from "./SiteHeader";

type Cart = { restaurantId: string | null; lines: CartLine[] };
type Customer = { fullName: string; phone: string; note: string };
const emptyCart: Cart = { restaurantId: null, lines: [] };

function Header({
  count,
  onCart,
  home = false,
  places = false,
}: {
  count: number;
  onCart: () => void;
  home?: boolean;
  places?: boolean;
}) {
  return (
    <SiteHeader count={count} onCart={onCart} onHero={home} current={home || places ? "places" : null} />
  );
}
function Status({ restaurant, now }: { restaurant: Restaurant; now: Date }) {
  const status = openingStatus(restaurant, now);
  return (
    <span className={`opening-status ${status.open ? "is-open" : "is-closed"}`}>
      <span aria-hidden="true">●</span> {status.text}
    </span>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <b>KjørNesodden</b>
        <p>Levering av mat og dagligvarer på Nesodden.</p>
        <a href="tel:+4793461991">Ring oss: 934 61 991</a>
      </div>
      <div>
        <p>Du betaler når varene er levert.</p>
        <Link to="/" hash="restauranter">Restauranter</Link>
        <span> · </span>
        <Link to="/om-oss">Om oss</Link>
        <span> · </span>
        <Link to="/personvern">Personvern</Link>
        <Credit className="footer-credit" />
      </div>
    </footer>
  );
}
function Home({
  now,
  onSelect,
  title,
  intro,
}: {
  now: Date;
  onSelect: (id: string) => void;
  title?: ReactNode;
  intro?: string;
}) {
  return (
    <>
      <section className="home-intro">
        <div>
          <h1>
            {title ?? (
              <>
                Bestill med
                <br />
                KjørNesodden!
              </>
            )}
          </h1>
          <p>
            {intro ??
              "Velg restaurant, legg maten i kurven, så henter vi den og kjører den hjem til deg. Du betaler når varene er levert."}
          </p>
        </div>
        <div className="delivery-prices">
          <h2>Fast leveringspris</h2>
          {zones.map((zone) => (
            <div key={zone.id}>
              <span>{zone.name}</span>
              <b>{formatKr(zone.fee)}</b>
            </div>
          ))}
        </div>
      </section>
      <main className="restaurant-picker" id="restauranter">
        <h2>Restauranter på Nesodden</h2>
        <p className="picker-intro">
          Finn din favoritt på Nesodden. Se menyen eller send oss et ønske.
        </p>
        <ReviewsBadge />
        <div className="restaurant-cards">
          {restaurants.map((r) => (
            <Link
              className={`restaurant-card restaurant-${r.id}`}
              to="/restauranter/$slug"
              params={{ slug: placeById(r.id)?.slug ?? r.id }}
              key={r.id}
            >
              <div className="restaurant-photo">
                <img
                  src={r.image}
                  alt={r.id === "mamagreek" ? "Illustrasjon av gresk mat" : r.name}
                  loading={r.id === "signalen" ? "eager" : "lazy"}
                  width="600"
                  height="340"
                />
                {r.logo && (
                  <span className="restaurant-logo">
                    <img src={r.logo} alt={`${r.name} logo`} />
                  </span>
                )}
              </div>
              <div className="restaurant-card-body">
                <h3>{r.name}</h3>
                <p>
                  {r.cuisine}
                  <br />
                  <span>{r.address}</span>
                </p>
                <Status restaurant={r} now={now} />
                <span className="card-cta">
                  {r.orderingMode === "menu" ? "Se menyen" : "Send forespørsel"}
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
          <button
            type="button"
            className="restaurant-card other-card"
            onClick={() => onSelect("annet")}
          >
            <div className="restaurant-photo">
              <img
                src="/images/other-delivery.svg"
                alt="Handleposer med dagligvarer og hurtigmat"
                width="600"
                height="340"
                loading="lazy"
              />
            </div>
            <div className="restaurant-card-body">
              <h3>Noe annet?</h3>
              <p>Kiwi, REMA, Coop, Joker, McDonald’s eller Burger King.</p>
              <span className="other-helper">Skriv hva du vil ha, så ordner vi det.</span>
              <span className="card-cta">
                Skriv hva du vil ha
                <ArrowRight size={16} />
              </span>
            </div>
          </button>
        </div>
        <Reviews />
      </main>
    </>
  );
}

function Menu({
  restaurant,
  now,
  onAdd,
  heading,
}: {
  restaurant: Restaurant;
  now: Date;
  heading?: string;
  onAdd: (item: MenuItem, variantId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showAllergens, setShowAllergens] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(restaurant.categories[0]?.id);
  const status = openingStatus(restaurant, now);
  const allergenNames = [
    ...new Set(restaurant.categories.flatMap((c) => c.items.flatMap((item) => item.allergens))),
  ].sort();
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("nb-NO")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  const categories = restaurant.categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          normalize(
            `${item.number ?? ""} ${item.name} ${item.description} ${item.subheading}`,
          ).includes(normalize(query)) && !item.allergens.some((a) => excluded.includes(a)),
      ),
    }))
    .filter((c) => c.items.length);
  // Forsidebilde: eget banner, ellers kortbildet. Tegninger (svg) brukes ikke som forsidebilde.
  const cover = restaurant.banner || (restaurant.image && !restaurant.image.endsWith(".svg") ? restaurant.image : "");
  return (
    <>
      <section className={`menu-intro${cover ? " has-cover" : ""}`} data-place={restaurant.id}>
        {cover && <div className="menu-cover" style={{ backgroundImage: `url(${cover})` }} aria-hidden="true" />}
        <div className="menu-intro-inner">
          {restaurant.logo && (
            <img className="menu-logo" src={restaurant.logo} alt={`${restaurant.name} logo`} />
          )}
          <div>
            {heading ? (
              <Crumbs name={restaurant.name} />
            ) : (
              <Link to="/" className="back-link">
                <ArrowLeft size={16} /> Alle restauranter
              </Link>
            )}
            <h1>{heading ?? restaurant.name}</h1>
            <p>
              {restaurant.cuisine} · {restaurant.address}
            </p>
            <Status restaurant={restaurant} now={now} />
          </div>
          <details className="opening-hours">
            <summary>
              <Clock3 size={16} /> Bestillingstider
            </summary>
            <div>
              {restaurant.hours &&
                [1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <p key={day}>
                    <span>{dayNames[day]}</span>
                    <b>
                      {restaurant.hours![day]
                        ? `${formatTime(restaurant.hours![day]![0])}-${formatTime(restaurant.hours![day]![1])}`
                        : "Stengt"}
                    </b>
                  </p>
                ))}
            </div>
          </details>
        </div>
      </section>
      <nav className="menu-tabs" aria-label="Menykategorier">
        <div>
          {restaurant.categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={activeCategory === c.id ? "active" : ""}
              onClick={() => {
                setActiveCategory(c.id);
                document
                  .getElementById(`category-${c.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>
      <div className="menu-toolbar">
        <div className="menu-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Søk i menyen"
            aria-label="Søk i menyen"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {!!allergenNames.length && (
          <button
            type="button"
            className={`allergen-button${showAllergens ? " active" : ""}`}
            aria-expanded={showAllergens}
            aria-controls="allergen-filters"
            onClick={() => setShowAllergens(!showAllergens)}
          >
            <SlidersHorizontal size={17} /> Allergener
            {excluded.length ? ` (${excluded.length})` : ""}
          </button>
        )}
      </div>
      {showAllergens && (
        <div className="allergen-filters" id="allergen-filters">
          <p>
            Skjul retter med oppgitte allergener. Filteret dekker bare informasjonen i menyen;
            avklar allergier med restauranten.
          </p>
          <div>
            {allergenNames.map((a) => (
              <label key={a}>
                <input
                  type="checkbox"
                  checked={excluded.includes(a)}
                  onChange={(e) =>
                    setExcluded(
                      e.target.checked ? [...excluded, a] : excluded.filter((x) => x !== a),
                    )
                  }
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="menu-note">
        {restaurant.note}
        {restaurant.sources.length > 0 && (
          <details>
            <summary>Se menyens kilder</summary>
            {restaurant.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            ))}
          </details>
        )}
      </div>
      {!status.open && (
        <p className="closed-notice" role="status">
          <Clock3 size={19} />
          <span>
            <b>Restauranten er stengt for bestilling.</b> Du kan fortsatt se hele menyen.{" "}
            {status.text}.
          </span>
        </p>
      )}
      {!categories.length && (
        <p className="empty-results">
          Ingen retter passer søket. Prøv et annet søk eller fjern allergenfiltre.
        </p>
      )}
      <div className="menu-sections">
        {categories.map((category) => (
          <section id={`category-${category.id}`} key={category.id} className="menu-category">
            <h2>{category.name}</h2>
            {category.description && <p className="category-description">{category.description}</p>}
            {category.items.map((item, i) => (
              <div key={item.id}>
                {item.subheading && item.subheading !== category.items[i - 1]?.subheading && (
                  <h3 className="menu-subheading">{item.subheading}</h3>
                )}
                <article className="dish">
                  {item.image && (
                    <img
                      className="dish-image"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      width="110"
                      height="100"
                    />
                  )}
                  <div className="dish-text">
                    <h3>
                      {item.number && <span className="dish-number">{item.number}. </span>}
                      {item.name}
                      {item.tag && <span className="dish-tag">{item.tag}</span>}
                      {item.isNew && <span className="dish-tag">Nyhet</span>}
                    </h3>
                    {item.description && <p>{item.description}</p>}
                    {item.allergens.length > 0 && (
                      <small>Allergener: {item.allergens.join(", ")}</small>
                    )}
                  </div>
                  <div className="dish-actions">
                    {item.variants.map((v) => (
                      <button
                        type="button"
                        className="add-dish"
                        key={v.id}
                        disabled={!status.open}
                        onClick={() => onAdd(item, v.id)}
                        aria-label={`Legg til ${item.name}${v.label ? `, ${v.label}` : ""}, ${formatKr(v.price)}`}
                      >
                        <span>
                          {v.label && <small>{v.label}</small>}
                          {formatKr(v.price)}
                        </span>
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function OrderingApp({
  initialView = "home",
  heading,
  extra,
  homeTitle,
  homeIntro,
  active = "home",
}: {
  initialView?: string;
  heading?: string;
  extra?: ReactNode;
  homeTitle?: ReactNode;
  homeIntro?: string;
  active?: "home" | "places";
} = {}) {
  const routerNavigate = useNavigate();
  const [view, setView] = useState(initialView);
  const [now, setNow] = useState(() => new Date());
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [restored, setRestored] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [addressText, setAddressText] = useState("");
  const [customer, setCustomer] = useState<Customer>({ fullName: "", phone: "", note: "" });
  const [cartOpen, setCartOpen] = useState(false);
  const [pendingRestaurant, setPendingRestaurant] = useState<string | null>(null);
  // Retten kunden prøvde å legge i kurven da byttet ble spurt om. Legges inn etter «Tøm og bytt».
  const [pendingLine, setPendingLine] = useState<CartLine | null>(null);
  const [optionSelection, setOptionSelection] = useState<{
    restaurantId: string;
    item: MenuItem;
    variantId: string;
    ids: string[];
  } | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const submissionRef = useRef<{ content: string; id: string } | null>(null);
  useEffect(() => {
    function readHash() {
      // Restaurantsidene har egen adresse. # brukes bare på forsiden.
      if (initialView !== "home") return;
      const hash = window.location.hash.slice(1);
      // Gamle lenker som /#tonys sendes videre til restaurantens egen side.
      const legacy = restaurantById(hash) ? placeById(hash) : undefined;
      if (legacy) {
        window.location.replace(`/restauranter/${legacy.slug}`);
        return;
      }
      setView(hash === "annet" ? hash : "home");
      setSubmitError("");
      setReceipt(null);
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    try {
      const saved: Cart = JSON.parse(localStorage.getItem("kn-cart-v1") || "null");
      const restaurant = saved?.restaurantId ? restaurantById(saved.restaurantId) : null;
      if (restaurant && Array.isArray(saved.lines)) {
        const lines = saved.lines.filter(
          (line) =>
            Array.isArray(line.optionIds) &&
            new Set(line.optionIds).size === line.optionIds.length &&
            Number.isInteger(line.quantity) &&
            line.quantity > 0 &&
            line.quantity <= 20 &&
            describeLine(restaurant, line),
        );
        setCart(
          lines.length ? { restaurantId: restaurant.id, lines: lines.slice(0, 30) } : emptyCart,
        );
      }
    } catch {
      /* An invalid saved cart starts empty. */
    }
    setRestored(true);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (restored)
      try {
        localStorage.setItem("kn-cart-v1", JSON.stringify(cart));
      } catch {
        /* Ordering works when storage is unavailable. */
      }
  }, [cart, restored]);
  const restaurant = restaurantById(view) ?? null;
  const cartRestaurant = cart.restaurantId ? (restaurantById(cart.restaurantId) ?? null) : null;
  const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartRestaurant
    ? cart.lines.reduce(
        (sum, line) => sum + (describeLine(cartRestaurant, line)?.lineTotal ?? 0),
        0,
      )
    : 0;
  const home = view === "home" && !receipt;
  function navigate(id: string) {
    setOptionSelection(null);
    setSubmitError("");
    setReceipt(null);
    const place = placeById(id);
    if (id === view) setView(id);
    else if (place)
      void routerNavigate({ to: "/restauranter/$slug", params: { slug: place.slug } });
    else if (initialView !== "home")
      void routerNavigate({ to: "/", hash: id === "home" ? undefined : id });
    else {
      const next = id === "home" ? "" : id;
      if (window.location.hash.slice(1) === next) setView(id);
      else window.location.hash = next;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function select(id: string) {
    if (submitting) return;
    const next = restaurantById(id);
    if (next?.orderingMode === "menu" && cart.lines.length && cart.restaurantId !== id)
      setPendingRestaurant(id);
    else navigate(id);
  }
  function addLine(item: MenuItem, variantId: string, optionIds: string[] = []) {
    if (!restaurant || !openingStatus(restaurant, new Date()).open) {
      setNow(new Date());
      setAnnouncement("Restauranten er stengt for bestilling.");
      return;
    }
    if (cart.lines.length && cart.restaurantId !== restaurant.id) {
      setPendingLine({ itemId: item.id, variantId, optionIds: [...optionIds].sort(), quantity: 1 });
      setPendingRestaurant(restaurant.id);
      return;
    }
    const key = lineKey({ itemId: item.id, variantId, optionIds });
    const existing = cart.lines.find((line) => lineKey(line) === key);
    if (existing?.quantity === 20 || (!existing && cart.lines.length >= 30)) {
      setAnnouncement("Kurven kan ha høyst 30 ulike varer og 20 av hver vare.");
      return;
    }
    setCart((previous) => {
      const lines = previous.restaurantId === restaurant.id ? [...previous.lines] : [];
      const index = lines.findIndex((line) => lineKey(line) === key);
      if (index >= 0)
        lines[index] = { ...lines[index], quantity: Math.min(lines[index].quantity + 1, 20) };
      else if (lines.length < 30)
        lines.push({ itemId: item.id, variantId, optionIds: [...optionIds].sort(), quantity: 1 });
      return { restaurantId: restaurant.id, lines };
    });
    setAnnouncement(`${item.name} er lagt i kurven.`);
  }
  function add(item: MenuItem, variantId: string) {
    if (submitting) return;
    if (item.options.length && restaurant)
      setOptionSelection({ restaurantId: restaurant.id, item, variantId, ids: [] });
    else addLine(item, variantId);
  }
  function changeQuantity(index: number, delta: number) {
    setCart((previous) => {
      const lines = previous.lines
        .map((line, i) =>
          i === index ? { ...line, quantity: Math.min(line.quantity + delta, 20) } : line,
        )
        .filter((line) => line.quantity > 0);
      return lines.length ? { ...previous, lines } : emptyCart;
    });
  }
  async function submit(payload: Record<string, unknown>) {
    if (submitting) return;
    if (!/^\+?\d{8,15}$/.test(String(payload.phone).replace(/[\s()-]/g, ""))) {
      setSubmitError("Fyll inn et gyldig telefonnummer.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const content = JSON.stringify(payload);
    if (submissionRef.current?.content !== content)
      submissionRef.current = { content, id: crypto.randomUUID() };
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: submissionRef.current!.id }),
      });
      const result = await response.json().catch(() => {
        throw new Error("Vi kunne ikke bekrefte sendingen. Ring 934 61 991 før du prøver igjen.");
      });
      if (!response.ok || result.success !== true || !result.receipt)
        throw new Error(result.error || "Bestillingen kunne ikke sendes. Ring 934 61 991.");
      setReceipt(result.receipt);
      setCart(emptyCart);
      setCartOpen(false);
      setAddress(null);
      setAddressText("");
      setCustomer({ fullName: "", phone: "", note: "" });
      submissionRef.current = null;
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setSubmitError(
        error instanceof TypeError
          ? "Vi kunne ikke bekrefte sendingen. Ring 934 61 991 før du prøver igjen."
          : error instanceof Error
            ? error.message
            : "Vi kunne ikke bekrefte sendingen. Ring 934 61 991 før du prøver igjen.",
      );
    } finally {
      setSubmitting(false);
      setNow(new Date());
    }
  }
  const checkoutProps = {
    address,
    addressText,
    onAddressText: setAddressText,
    onAddress: setAddress,
    customer,
    onCustomer: setCustomer,
    submitting,
    submitError,
    onSubmit: submit,
  };
  const panel = (
    <CartPanel
      {...checkoutProps}
      restaurant={cartRestaurant}
      lines={cart.lines}
      now={now}
      onQuantity={changeQuantity}
    />
  );
  const selectedVariant = optionSelection?.item.variants.find(
    (v) => v.id === optionSelection.variantId,
  );
  const optionTotal =
    (selectedVariant?.price ?? 0) +
    (optionSelection?.ids.reduce(
      (sum, id) => sum + (optionSelection.item.options.find((o) => o.id === id)?.price ?? 0),
      0,
    ) ?? 0);
  return (
    <div className={`ordering-root${home ? " home-view" : ""}`}>
      <div className={home ? "home-surface" : "page-surface"}>
        <Header home={home} places={active === "places"} count={count} onCart={() => setCartOpen(true)} />
        {receipt ? (
          <ReceiptPage receipt={receipt} onReset={() => navigate("home")} />
        ) : home ? (
          <Home now={now} onSelect={select} title={homeTitle} intro={homeIntro} />
        ) : restaurant?.orderingMode === "menu" ? (
          <>
            <div className="restaurant-layout">
              <div className="menu-column">
                <Menu
                  key={restaurant.id}
                  restaurant={restaurant}
                  now={now}
                  onAdd={add}
                  heading={heading}
                />
              </div>
              <aside className="desktop-cart" aria-label="Din bestilling">
                {panel}
              </aside>
            </div>
          </>
        ) : (
          <RequestForm
            key={view}
            restaurant={restaurant}
            now={now}
            heading={heading}
            {...checkoutProps}
          />
        )}
        {!receipt && extra}
      </div>
      <Footer />
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {!!count && !receipt && (
        <button type="button" className="mobile-cart-bar" onClick={() => setCartOpen(true)}>
          <span>
            <ShoppingBag size={19} /> Se bestilling ({count})
          </span>
          <b>
            {formatKr(subtotal + (address?.zone.fee ?? 0))}
            {!address && <small> + levering</small>}
          </b>
        </button>
      )}
      <Dialog.Root
        open={cartOpen}
        onOpenChange={(open) => {
          if (!submitting) setCartOpen(open);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="cart-dialog">
            <Dialog.Title className="sr-only">Din bestilling</Dialog.Title>
            <Dialog.Description className="sr-only">
              Kontroller varene, velg leveringsadresse og send bestillingen.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Lukk kurven" disabled={submitting}>
              <X size={22} />
            </Dialog.Close>
            {panel}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!pendingRestaurant}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRestaurant(null);
            setPendingLine(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="small-dialog">
            <Dialog.Title>Bytte restaurant?</Dialog.Title>
            <Dialog.Description>
              Du har varer fra {cartRestaurant?.name} i kurven. Vi bestiller fra én restaurant om
              gangen. Tøm kurven for å bytte til {restaurantById(pendingRestaurant ?? "")?.name}.
            </Dialog.Description>
            <div className="dialog-actions">
              <Dialog.Close className="secondary-button">Behold kurven</Dialog.Close>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const id = pendingRestaurant!;
                  setCart(pendingLine ? { restaurantId: id, lines: [pendingLine] } : emptyCart);
                  if (pendingLine) setAnnouncement("Kurven er tømt, og retten du valgte er lagt i kurven.");
                  setPendingLine(null);
                  setPendingRestaurant(null);
                  navigate(id);
                }}
              >
                Tøm og bytt
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!optionSelection}
        onOpenChange={(open) => {
          if (!open) setOptionSelection(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="small-dialog options-dialog">
            <Dialog.Title>{optionSelection?.item.name}</Dialog.Title>
            <Dialog.Description>Velg eventuelle tilvalg.</Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Lukk tilvalg">
              <X size={20} />
            </Dialog.Close>
            <div className="option-list">
              {optionSelection?.item.options.map((o) => (
                <label key={o.id}>
                  <input
                    type="checkbox"
                    checked={optionSelection.ids.includes(o.id)}
                    onChange={(e) =>
                      setOptionSelection({
                        ...optionSelection,
                        ids: e.target.checked
                          ? [...optionSelection.ids, o.id]
                          : optionSelection.ids.filter((id) => id !== o.id),
                      })
                    }
                  />
                  <span>{o.label}</span>
                  <b>+{formatKr(o.price)}</b>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                if (optionSelection)
                  addLine(optionSelection.item, optionSelection.variantId, optionSelection.ids);
                setOptionSelection(null);
              }}
            >
              Legg i kurven · {formatKr(optionTotal)}
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
