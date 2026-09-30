import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, MapPin } from "lucide-react";
import type { Address } from "../lib/catalog";
import { formatKr } from "../lib/catalog";

type Props = {
  value: Address | null;
  onChange: (address: Address | null) => void;
  error?: string;
  disabled?: boolean;
};
export function AddressInput({ value, onChange, error, disabled }: Props) {
  const id = useId();
  const [query, setQuery] = useState(value?.label ?? "");
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value) {
      setQuery(value.label);
      setExpanded(false);
    }
  }, [value]);
  useEffect(() => {
    setSuggestions([]);
    setActive(-1);
    setLookupError("");
    if (value || query.trim().length < 3) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/addresses?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Adressesøket feilet.");
        if (!controller.signal.aborted) setSuggestions(result.addresses);
      } catch (err) {
        if (!controller.signal.aborted)
          setLookupError(err instanceof Error ? err.message : "Adressesøket feilet. Prøv igjen.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, value]);
  function select(address: Address) {
    onChange(address);
    setQuery(address.label);
    setExpanded(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }
  const open = expanded && !value && query.trim().length >= 3;
  return (
    <div className="address-field">
      <label htmlFor={id}>Adresse vi skal levere til</label>
      <div className="address-control">
        <MapPin size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Begynn å skrive gate og husnummer"
          value={query}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-invalid={!!error}
          aria-describedby={`${id}-info`}
          aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(null);
            setExpanded(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setExpanded(false);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setExpanded(true);
              setActive((a) => Math.min(a + 1, suggestions.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            }
            if (event.key === "Enter" && open && active >= 0 && suggestions[active]) {
              event.preventDefault();
              select(suggestions[active]);
            }
          }}
        />
        {loading && <LoaderCircle className="spin" size={18} aria-hidden="true" />}
      </div>
      {open && (
        <div
          className="address-suggestions"
          id={`${id}-list`}
          role="listbox"
          aria-label="Adresser på Nesodden"
        >
          {loading && <p role="status">Søker etter adresser …</p>}
          {!loading && lookupError && <p role="alert">{lookupError}</p>}
          {!loading && !lookupError && !suggestions.length && (
            <p>Ingen treff på Nesodden. Prøv gate og husnummer.</p>
          )}
          {suggestions.map((address, i) => (
            <button
              type="button"
              role="option"
              id={`${id}-option-${i}`}
              aria-selected={active === i}
              key={address.id}
              className={active === i ? "highlighted" : ""}
              tabIndex={-1}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => select(address)}
            >
              <span>
                {address.streetAddress}
                <small>
                  {address.postalCode} {address.postalPlace}
                </small>
              </span>
              <b>{formatKr(address.zone.fee)}</b>
            </button>
          ))}
        </div>
      )}
      <div
        id={`${id}-info`}
        className={`address-info${value ? " verified" : ""}`}
        aria-live="polite"
      >
        {value ? (
          <>
            <CheckCircle2 size={16} /> Levering: {formatKr(value.zone.fee)} · {value.zone.name}
          </>
        ) : (
          "Vi leverer bare til Nesodden. Velg en adresse fra forslagene."
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
