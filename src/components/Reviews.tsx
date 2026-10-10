import { Star } from "lucide-react";

// Ekte omtaler fra Google-profilen til KjørNesodden, hentet 2026-10-10.
// Oppdater tallene og sitatene for hånd når nye omtaler kommer.
export const GOOGLE_RATING = { score: "5,0", count: 5 };

const REVIEWS = [
  {
    name: "Arild A.",
    text: "Dette var akkurat det Nesodden trengte! Bestillingen ble levert rett på døren. Rask service, god kommunikasjon og hyggelig levering.",
  },
  {
    name: "Anne Hedvig V.",
    text: "Rask levering, hyggelig sjåfør og maten kom varm. Veldig praktisk med en lokal leveringstjeneste på Nesodden.",
  },
  {
    name: "Sidra H.",
    text: "Fantastisk service, god mat og rask levering! Veldig fornøyd og anbefaler KjørNesodden på det varmeste.",
  },
];

function Stars() {
  return (
    <span className="review-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function ReviewsBadge() {
  return (
    <p className="reviews-badge">
      <Stars />
      <span>
        <b>{GOOGLE_RATING.score} på Google</b>, {GOOGLE_RATING.count} omtaler
      </span>
    </p>
  );
}

export function Reviews({ title = "Det kundene sier" }: { title?: string }) {
  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews-head">
        <h2 id="reviews-title">{title}</h2>
        <ReviewsBadge />
      </div>
      <div className="reviews-grid">
        {REVIEWS.map((r) => (
          <figure className="review-card" key={r.name}>
            <Stars />
            <blockquote>«{r.text}»</blockquote>
            <figcaption>{r.name}, omtale på Google</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}