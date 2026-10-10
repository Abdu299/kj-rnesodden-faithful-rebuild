import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { placeById, placePath } from "../../shared/places.js";

// Samme toppmeny på alle sider: logo (til forsiden), Restauranter, Om oss og Kurv.
// På bestillingssidene åpner Kurv kurven. På de andre sidene leses kurven fra
// nettleseren, og Kurv tar kunden til restauranten kurven gjelder.
export function SiteHeader({
  count,
  onCart,
  onHero = false,
  current = null,
}: {
  count?: number;
  onCart?: () => void;
  onHero?: boolean;
  current?: "places" | "about" | null;
}) {
  const [saved, setSaved] = useState<{ count: number; href: string }>({ count: 0, href: "/" });
  useEffect(() => {
    if (onCart) return;
    try {
      const cart = JSON.parse(localStorage.getItem("kn-cart-v1") || "null");
      const lines: { quantity?: unknown }[] = Array.isArray(cart?.lines) ? cart.lines : [];
      const total = lines.reduce(
        (sum, line) => sum + (Number.isInteger(line?.quantity) ? Number(line.quantity) : 0),
        0,
      );
      const place = cart?.restaurantId ? placeById(cart.restaurantId) : undefined;
      setSaved({ count: total, href: place && total ? placePath(place) : "/" });
    } catch {
      /* Uten lagret kurv vises Kurv (0). */
    }
  }, [onCart]);

  const shown = onCart ? (count ?? 0) : saved.count;
  const cartClass = `cart-trigger${shown ? " has-items" : ""}`;
  const cartLabel = (
    <>
      <ShoppingBag size={18} /> <span>Kurv ({shown})</span>
    </>
  );

  return (
    <header className={`site-header${onHero ? " on-hero" : ""}`}>
      <Link className="site-brand" to="/" aria-label="KjørNesodden, til forsiden">
        <img
          className="brand-logo"
          src="/images/kjornesodden-logo-mork.webp"
          alt="KjørNesodden"
          width="809"
          height="160"
        />
      </Link>
      <nav aria-label="Hovedmeny">
        <Link className={current === "places" ? "current" : ""} to="/" hash="restauranter">
          Restauranter
        </Link>
        <Link className={current === "about" ? "current" : ""} to="/om-oss">
          Om oss
        </Link>
        {onCart ? (
          <button type="button" className={cartClass} onClick={onCart} aria-label={`Åpne kurven (${shown})`}>
            {cartLabel}
          </button>
        ) : (
          <a className={cartClass} href={saved.href} aria-label={`Gå til kurven (${shown})`}>
            {cartLabel}
          </a>
        )}
      </nav>
    </header>
  );
}
