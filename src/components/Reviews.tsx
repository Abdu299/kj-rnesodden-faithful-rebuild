import { ExternalLink, PenLine, Star, ThumbsUp } from "lucide-react";

// Ekte omtaler fra KjørNesodden, hentet for hånd. Oppdater når nye omtaler kommer.
// Google: 5 omtaler per 2026-10-10. Facebook-siden hadde 0 anbefalinger per 2026-10-12.
// Legg til Facebook-anbefalinger med source: "facebook" når de finnes. Skriv dem ordrett.
const GOOGLE_PLACE_ID = "ChIJodB0sEZBQUYRIsOoGnhHC8A";
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
export const FACEBOOK_URL = "https://www.facebook.com/61592634265932";
export const FACEBOOK_REVIEWS_URL = `${FACEBOOK_URL}/reviews`;

export const GOOGLE_RATING = { score: "5,0", count: 5 };

type Source = "google" | "facebook";
type Review = { name: string; text: string; source: Source };

const REVIEWS: Review[] = [
  {
    name: "Arild A",
    source: "google",
    text: "Dette var akkurat det Nesodden trengte! Bestillingen ble levert rett på døren. Rask service, god kommunikasjon og hyggelig levering.",
  },
  {
    name: "Anne Hedvig V",
    source: "google",
    text: "Rask levering, hyggelig sjåfør og maten kom varm. Veldig praktisk med en lokal leveringstjeneste på Nesodden.",
  },
  {
    name: "Sidra H",
    source: "google",
    text: "Fantastisk service, god mat og rask levering! Veldig fornøyd og anbefaler KjørNesodden på det varmeste.",
  },
];

const SOURCE = {
  google: { label: "Google", caption: "omtale på Google", url: GOOGLE_REVIEWS_URL },
  facebook: { label: "Facebook", caption: "anbefaler på Facebook", url: FACEBOOK_REVIEWS_URL },
} as const;

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
    <a
      className="reviews-badge"
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener"
      aria-label={`${GOOGLE_RATING.score} av 5 på Google, ${GOOGLE_RATING.count} omtaler. Les omtalene på Google`}
    >
      <Stars />
      <span>
        <b>{GOOGLE_RATING.score} på Google</b>, {GOOGLE_RATING.count} omtaler
      </span>
      <ExternalLink size={14} aria-hidden="true" />
    </a>
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
        {REVIEWS.map((r) => {
          const s = SOURCE[r.source];
          return (
            <a
              className={`review-card review-${r.source}`}
              key={r.name}
              href={s.url}
              target="_blank"
              rel="noopener"
              aria-label={`Les omtalen fra ${r.name} på ${s.label}`}
            >
              <span className="review-card-top">
                {r.source === "google" ? <Stars /> : <ThumbsUp size={16} aria-hidden="true" />}
                <span className="review-source">{s.label}</span>
              </span>
              <blockquote>«{r.text}»</blockquote>
              <span className="review-name">
                {r.name} - {s.caption}
              </span>
            </a>
          );
        })}
      </div>
      <div className="reviews-actions">
        <a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener">
          <PenLine size={16} aria-hidden="true" /> Skriv en omtale på Google
        </a>
        <a href={FACEBOOK_REVIEWS_URL} target="_blank" rel="noopener">
          <ThumbsUp size={16} aria-hidden="true" /> Anbefal oss på Facebook
        </a>
      </div>
    </section>
  );
}
