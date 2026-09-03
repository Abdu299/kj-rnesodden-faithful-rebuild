import { useState } from "react";
import { Link } from "@tanstack/react-router";

type Props = {
  active: "home" | "about" | "delete" | "privacy";
};

export function TopBar({ active }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="topbar">
      <Link to="/" className="logo" onClick={close}>
        KjørNesodden.no
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-label="Meny"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>

      <nav id="primary-nav" className={`nav${open ? " open" : ""}`}>
        <Link to="/" className={active === "home" ? "active" : ""} onClick={close}>
          Hjem
        </Link>
        <Link
          to="/om-oss"
          className={active === "about" ? "active" : ""}
          onClick={close}
        >
          Om oss
        </Link>
      </nav>
    </div>
  );
}