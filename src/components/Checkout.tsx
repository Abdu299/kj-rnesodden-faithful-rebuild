import { useId, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { AddressInput } from "./AddressInput";
import {
  formatKr,
  describeLine,
  type Address,
  type CartLine,
  type Receipt,
  type Restaurant,
} from "../lib/catalog";
import { dayNames, formatTime, openingStatus } from "../../shared/order-rules.js";

export type Customer = { fullName: string; phone: string; note: string };
export type CheckoutProps = {
  address: Address | null;
  addressText: string;
  onAddressText: (text: string) => void;
  onAddress: (address: Address | null) => void;
  customer: Customer;
  onCustomer: (customer: Customer) => void;
  submitting: boolean;
  submitError: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};
function CustomerFields({
  customer,
  onCustomer,
  submitting,
}: Pick<CheckoutProps, "customer" | "onCustomer" | "submitting">) {
  const id = useId();
  return (
    <div className="customer-fields">
      <label htmlFor={`${id}-name`}>Navn</label>
      <input
        id={`${id}-name`}
        name="fullName"
        autoComplete="name"
        placeholder="Fornavn Etternavn"
        required
        maxLength={120}
        value={customer.fullName}
        disabled={submitting}
        onChange={(e) => onCustomer({ ...customer, fullName: e.target.value })}
      />
      <label htmlFor={`${id}-phone`}>Telefonnummer</label>
      <input
        id={`${id}-phone`}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="Eks. 400 00 000"
        required
        minLength={8}
        maxLength={30}
        value={customer.phone}
        disabled={submitting}
        onChange={(e) => onCustomer({ ...customer, phone: e.target.value })}
      />
      <label htmlFor={`${id}-note`}>Beskjed (valgfritt)</label>
      <textarea
        id={`${id}-note`}
        name="note"
        maxLength={800}
        rows={3}
        placeholder="F.eks. uten løk, ring på døra"
        value={customer.note}
        disabled={submitting}
        onChange={(e) => onCustomer({ ...customer, note: e.target.value })}
      />
    </div>
  );
}
function SubmitFoot({
  submitting,
  submitError,
  disabled = false,
  label,
}: {
  submitting: boolean;
  submitError: string;
  disabled?: boolean;
  label: string;
}) {
  return (
    <>
      {submitError && (
        <div className="submit-error" role="alert">
          {submitError}
        </div>
      )}
      <button
        className="primary-button submit-order"
        type="submit"
        disabled={submitting || disabled}
      >
        {submitting ? (
          <>
            <LoaderCircle className="spin" size={18} /> Sender …
          </>
        ) : (
          label
        )}
      </button>
      <p className="payment-note">Du betaler etter at varene er levert.</p>
      <p className="privacy-note">
        Vi bruker navn, telefon og adresse for å håndtere leveringen.{" "}
        <Link to="/personvern">Les om personvern</Link>.
      </p>
    </>
  );
}
export function CartPanel({
  restaurant,
  lines,
  onQuantity,
  now,
  ...props
}: CheckoutProps & {
  restaurant: Restaurant | null;
  lines: CartLine[];
  onQuantity: (index: number, delta: number) => void;
  now: Date;
}) {
  const [addressError, setAddressError] = useState("");
  const status = restaurant ? openingStatus(restaurant, now) : null;
  const subtotal = restaurant
    ? lines.reduce((sum, line) => sum + (describeLine(restaurant, line)?.lineTotal ?? 0), 0)
    : 0;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!props.addressText.trim()) {
      setAddressError("Skriv adressen vi skal levere til.");
      return;
    }
    setAddressError("");
    void props.onSubmit({
      kind: "menu",
      restaurantId: restaurant?.id,
      items: lines,
      address: props.address
        ? { id: props.address.id, streetAddress: props.address.streetAddress }
        : undefined,
      addressText: props.addressText.trim(),
      quotedTotal: props.address ? subtotal + props.address.zone.fee : undefined,
      ...props.customer,
    });
  }
  return (
    <div className="cart-panel">
      <h2>Din bestilling</h2>
      {restaurant && <p className="cart-restaurant">Fra {restaurant.name}</p>}
      {!lines.length ? (
        <div className="empty-cart">
          <ShoppingBag size={34} />
          <p>Kurven er tom.</p>
          <span>Trykk på prisen til en rett for å legge den i kurven.</span>
        </div>
      ) : (
        <>
          <div className="cart-lines">
            {lines.map((line, i) => {
              const description = restaurant ? describeLine(restaurant, line) : null;
              return (
                description && (
                  <div
                    className="cart-line"
                    key={`${line.itemId}-${line.variantId}-${line.optionIds.join(",")}`}
                  >
                    <div>
                      <b>{description.name}</b>
                      {description.variant && <small>{description.variant}</small>}
                      {description.options.length > 0 && (
                        <small>{description.options.join(", ")}</small>
                      )}
                      <span className="cart-line-total">{formatKr(description.lineTotal)}</span>
                    </div>
                    <div className="quantity-control">
                      <button
                        type="button"
                        disabled={props.submitting}
                        onClick={() => onQuantity(i, -1)}
                        aria-label={`Færre ${description.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span aria-label="Antall">{line.quantity}</span>
                      <button
                        type="button"
                        disabled={props.submitting || line.quantity >= 20}
                        onClick={() => onQuantity(i, 1)}
                        aria-label={`Flere ${description.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )
              );
            })}
          </div>
          <form onSubmit={submit} className="checkout-form">
            <AddressInput
              value={props.address}
              query={props.addressText}
              onQuery={(text) => {
                props.onAddressText(text);
                setAddressError("");
              }}
              onChange={(a) => {
                props.onAddress(a);
                setAddressError("");
              }}
              error={addressError}
              disabled={props.submitting}
            />
            <div className="order-totals">
              <div>
                <span>Varer</span>
                <b>{formatKr(subtotal)}</b>
              </div>
              <div>
                <span>Levering</span>
                <span>{props.address ? formatKr(props.address.zone.fee) : "Fra adressen"}</span>
              </div>
              <div className="grand-total">
                <span>{props.address ? "Totalt" : "Varer før levering"}</span>
                <b>{formatKr(subtotal + (props.address?.zone.fee ?? 0))}</b>
              </div>
            </div>
            <CustomerFields {...props} />
            {!status?.open && (
              <p className="field-error" role="status">
                Restauranten er stengt. Du kan sende når den åpner igjen.
              </p>
            )}
            <SubmitFoot
              submitting={props.submitting}
              submitError={props.submitError}
              disabled={!status?.open}
              label={`Send bestilling${props.address ? ` · ${formatKr(subtotal + props.address.zone.fee)}` : ""}`}
            />
          </form>
        </>
      )}
    </div>
  );
}
export function RequestForm({
  restaurant,
  now,
  ...props
}: CheckoutProps & { restaurant: Restaurant | null; now: Date }) {
  const [type, setType] = useState(restaurant ? "Restaurant" : "");
  const [place, setPlace] = useState(restaurant?.name ?? "");
  const [description, setDescription] = useState("");
  const [addressError, setAddressError] = useState("");
  const id = useId();
  const status = restaurant ? openingStatus(restaurant, now) : null;
  const closed = !!restaurant?.hours && !status?.open;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (closed) return;
    if (!props.addressText.trim()) {
      setAddressError("Skriv adressen vi skal levere til.");
      return;
    }
    setAddressError("");
    void props.onSubmit({
      kind: "request",
      restaurantId: restaurant?.id,
      type,
      place,
      description,
      address: props.address
        ? { id: props.address.id, streetAddress: props.address.streetAddress }
        : undefined,
      addressText: props.addressText.trim(),
      ...props.customer,
    });
  }
  return (
    <main className="request-page">
      <a className="back-link" href="#">
        <ArrowLeft size={16} /> Alle restauranter
      </a>
      <h1>{restaurant ? `Noe fra ${restaurant.name}?` : "Noe annet du vil ha levert?"}</h1>
      <p className="request-lead">
        {restaurant
          ? "Send oss hva du ønsker. Vi sjekker meny, pris og tilgjengelighet og ringer deg før vi bestiller."
          : "Dagligvarer, hurtigmat eller noe fra et annet sted. Skriv hva du vil ha, så ringer vi deg og bekrefter pris før vi handler."}
      </p>
      {restaurant?.hours && (
        <div className="request-opening">
          <span className={`opening-status ${status?.open ? "is-open" : "is-closed"}`}>
            <span aria-hidden="true">●</span> {status?.text}
          </span>
          <details className="opening-hours">
            <summary>
              <Clock3 size={16} /> Bestillingstider
            </summary>
            <div>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const hours = restaurant.hours![day];
                return (
                  <p key={day}>
                    <span>{dayNames[day]}</span>
                    <b>{hours ? `${formatTime(hours[0])}–${formatTime(hours[1])}` : "Stengt"}</b>
                  </p>
                );
              })}
            </div>
          </details>
        </div>
      )}
      <div className="request-layout">
        <form className="request-form" onSubmit={submit}>
          <label htmlFor={`${id}-type`}>Type</label>
          <select
            id={`${id}-type`}
            required
            value={type}
            disabled={!!restaurant || props.submitting}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Velg type …</option>
            {["Dagligvarer", "McDonald's / Burger King", "Restaurant", "Annet"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label htmlFor={`${id}-place`}>Hvor skal vi hente?</label>
          <input
            id={`${id}-place`}
            required
            value={place}
            maxLength={180}
            disabled={!!restaurant || props.submitting}
            placeholder="F.eks. Kiwi Tangen, Burger King Vinterbro"
            onChange={(e) => setPlace(e.target.value)}
          />
          <label htmlFor={`${id}-description`}>Beskriv hva du vil kjøpe</label>
          <textarea
            id={`${id}-description`}
            required
            maxLength={1800}
            rows={5}
            value={description}
            disabled={props.submitting}
            placeholder="Skriv varer, mengde og eventuelle ønsker …"
            onChange={(e) => setDescription(e.target.value)}
          />
          <AddressInput
            value={props.address}
            query={props.addressText}
            onQuery={(text) => {
              props.onAddressText(text);
              setAddressError("");
            }}
            onChange={(a) => {
              props.onAddress(a);
              setAddressError("");
            }}
            error={addressError}
            disabled={props.submitting}
          />
          <div className="order-totals">
            <div>
              <span>Levering</span>
              <b>{props.address ? formatKr(props.address.zone.fee) : "Fra adressen"}</b>
            </div>
            <div>
              <span>Varer og endelig total</span>
              <span>Bekreftes med deg</span>
            </div>
          </div>
          <CustomerFields {...props} />
          {closed && (
            <p className="field-error" role="status">
              Restauranten er stengt. Du kan sende når den åpner igjen.
            </p>
          )}
          <SubmitFoot
            submitting={props.submitting}
            submitError={props.submitError}
            disabled={closed}
            label="Send forespørsel"
          />
        </form>
        <aside className="request-info">
          <img
            src={restaurant?.image ?? "/images/other-delivery.svg"}
            alt={restaurant ? restaurant.name : "Dagligvarer og hurtigmat"}
          />
          <h2>{restaurant?.name ?? "Vi ordner det"}</h2>
          <p>
            {restaurant?.address ??
              "Kiwi, REMA 1000, Coop Extra, Joker, McDonald’s og Burger King."}
          </p>
          <p>
            Velg et adresseforslag for å se leveringsprisen. Hvis du skriver adressen selv,
            bekrefter vi leveringsprisen med deg. Varepris og tilgjengelighet bekreftes før vi
            handler.
          </p>
          <a href="tel:+4793461991">Ring oss: 934 61 991</a>
        </aside>
      </div>
    </main>
  );
}
export function ReceiptPage({ receipt, onReset }: { receipt: Receipt; onReset: () => void }) {
  return (
    <main className="receipt-page">
      <CheckCircle2 size={54} className="receipt-check" />
      <h1>{receipt.kind === "menu" ? "Bestillingen er sendt!" : "Forespørselen er sendt!"}</h1>
      <p>
        Takk, {receipt.fullName.split(" ")[0]}!{" "}
        {receipt.kind === "menu"
          ? "Vi kontakter deg om leveringen."
          : "Vi ringer deg og bekrefter pris og tilgjengelighet før vi handler."}
      </p>
      <span className="order-reference">Referanse: {receipt.reference}</span>
      <div className="receipt-card">
        <h2>{receipt.restaurantName}</h2>
        <p>{receipt.address.label}</p>
        {receipt.lines.map((line, i) => (
          <div className="receipt-line" key={i}>
            <span>
              {line.quantity} × {line.name}
              {line.variant && <small>{line.variant}</small>}
              {line.options.length > 0 && <small>{line.options.join(", ")}</small>}
            </span>
            <b>{formatKr(line.lineTotal)}</b>
          </div>
        ))}
        <div className="order-totals">
          {receipt.subtotal !== null && (
            <div>
              <span>Varer</span>
              <b>{formatKr(receipt.subtotal)}</b>
            </div>
          )}
          <div>
            <span>Levering</span>
            <b>{receipt.deliveryFee !== null ? formatKr(receipt.deliveryFee) : "Fra adressen"}</b>
          </div>
          <div className="grand-total">
            <span>Totalt</span>
            <b>{receipt.total !== null ? formatKr(receipt.total) : "Bekreftes med deg"}</b>
          </div>
        </div>
        <p className="payment-note">Betaling skjer når varene er levert.</p>
      </div>
      <button type="button" className="primary-button" onClick={onReset}>
        Til restaurantene
      </button>
    </main>
  );
}
