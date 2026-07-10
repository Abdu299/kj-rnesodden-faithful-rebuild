import { useMemo, useState, type FormEvent } from "react";

const PLACES: Record<string, string[]> = {
  Restauranter: [
    "Viva Napoli Nesodden",
    "Pizzabakeren Nesodden",
    "Jafs Nesodden",
    "Tony’s Sushi Og Thai Restaurant",
    "Jonathan Sushi Nesodden",
    "Nye Flaskebekk Bistro",
    "Tåste Restaurant",
    "O’ Sole Mio",
    "MAMA GREEK KITCHEN",
    "Primitivo Ristorante",
    "Pio Pio pizzeria",
    "Annas Hybel",
    "Fagerstrand Vertshus AS",
  ],
  Dagligvarer: ["Meny", "Kiwi", "Coop Extra", "Coop Prix", "Joker", "Mester Grønn (Tangen)"],
  "McDonald’s / Burger King": ["McDonald's Nygaardskrysset", "Burger King Vinterbro"],
};

type FormState = {
  fullName: string;
  phone: string;
  deliveryAddress: string;
  deliveryType: string;
  deliveryPlace: string;
  description: string;
};

const empty: FormState = {
  fullName: "",
  phone: "",
  deliveryAddress: "",
  deliveryType: "",
  deliveryPlace: "",
  description: "",
};

// Placeholder submission — replace with a real backend or Lovable Cloud call later.
async function saveSubmissionLocally(data: FormState) {
  try {
    const key = "kn_submissions";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
    prev.push({ ...data, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(prev));
  } catch {
    /* ignore storage errors */
  }
}

export function OrderForm() {
  const [state, setState] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  const placeOptions = useMemo(
    () => (state.deliveryType ? PLACES[state.deliveryType] ?? [] : []),
    [state.deliveryType],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  function validate(s: FormState) {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!s.fullName.trim()) e.fullName = "Fyll inn navn";
    const digits = s.phone.replace(/\D/g, "");
    if (!s.phone.trim()) e.phone = "Fyll inn telefonnummer";
    else if (digits.length < 6 || digits.length > 15) e.phone = "Ugyldig telefonnummer";
    if (!s.deliveryAddress.trim()) e.deliveryAddress = "Fyll inn adresse";
    if (!s.deliveryType) e.deliveryType = "Velg type";
    if (!s.deliveryPlace) e.deliveryPlace = "Velg sted";
    if (!s.description.trim()) e.description = "Beskriv hva du vil kjøpe";
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(state);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    await saveSubmissionLocally(state);
    setState(empty);
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>Takk! 🙌</h3>
        <p>Vi har mottatt bestillingen og kontakter deg så fort som mulig.</p>
        <button className="btn" type="button" onClick={() => setSent(false)}>
          Send en ny bestilling
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit}>
      <label htmlFor="fullName">Navn</label>
      <input
        id="fullName"
        type="text"
        placeholder="Fornavn Etternavn"
        value={state.fullName}
        onChange={(e) => set("fullName", e.target.value)}
        aria-invalid={!!errors.fullName}
        required
      />
      {errors.fullName && <div className="field-error">{errors.fullName}</div>}

      <label htmlFor="phone">Telefonnummer</label>
      <input
        id="phone"
        type="tel"
        placeholder="Eks. 400 00 000"
        value={state.phone}
        onChange={(e) => set("phone", e.target.value)}
        aria-invalid={!!errors.phone}
        required
      />
      {errors.phone && <div className="field-error">{errors.phone}</div>}

      <label htmlFor="deliveryAddress">Adresse vi skal levere til</label>
      <input
        id="deliveryAddress"
        type="text"
        placeholder="Eks. Fjellstrandveien 10, Nesodden"
        value={state.deliveryAddress}
        onChange={(e) => set("deliveryAddress", e.target.value)}
        aria-invalid={!!errors.deliveryAddress}
        required
      />
      {errors.deliveryAddress && (
        <div className="field-error">{errors.deliveryAddress}</div>
      )}

      <label htmlFor="deliveryType">Type</label>
      <select
        id="deliveryType"
        value={state.deliveryType}
        onChange={(e) =>
          setState((s) => ({ ...s, deliveryType: e.target.value, deliveryPlace: "" }))
        }
        aria-invalid={!!errors.deliveryType}
        required
      >
        <option value="" disabled>
          Velg type ...
        </option>
        {Object.keys(PLACES).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {errors.deliveryType && <div className="field-error">{errors.deliveryType}</div>}

      <label htmlFor="deliveryPlace">Sted</label>
      <select
        id="deliveryPlace"
        value={state.deliveryPlace}
        onChange={(e) => set("deliveryPlace", e.target.value)}
        disabled={!state.deliveryType}
        aria-invalid={!!errors.deliveryPlace}
        required
      >
        <option value="" disabled>
          {state.deliveryType ? "Velg sted ..." : "Velg først type ..."}
        </option>
        {placeOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {errors.deliveryPlace && <div className="field-error">{errors.deliveryPlace}</div>}

      <label htmlFor="description">Beskriv hva du vil kjøpe</label>
      <textarea
        id="description"
        placeholder="F.eks. 2 pizza margarita, 1 cola, uten løk..."
        rows={4}
        value={state.description}
        onChange={(e) => set("description", e.target.value)}
        aria-invalid={!!errors.description}
        required
      />
      {errors.description && <div className="field-error">{errors.description}</div>}

      <button className="btn" type="submit">
        Send
      </button>

      <div className="meta">
        Vi kontakter deg snart og oppdaterer deg. Betaling skjer etter at du har mottatt varene.
      </div>
    </form>
  );
}