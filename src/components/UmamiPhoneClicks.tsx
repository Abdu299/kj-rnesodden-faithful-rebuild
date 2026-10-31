import { useEffect } from "react";
import { track } from "../lib/umami";

/** Teller klikk på telefonnummer (tel:-lenker) på alle sider. */
export function UmamiPhoneClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.('a[href^="tel:"]');
      if (link) track("Ringte", { side: window.location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}