import { Link } from "@tanstack/react-router";

// Synlige brødsmuler på restaurantsidene. Samme sti som BreadcrumbList-schemaet.
export function Crumbs({ name }: { name: string }) {
  return (
    <nav className="back-link app-crumbs" aria-label="Brødsmuler">
      <Link to="/">Forsiden</Link>
      <span aria-hidden="true"> › </span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}
