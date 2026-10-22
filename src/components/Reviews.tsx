import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, PenLine, Star, ThumbsUp } from "lucide-react";

// Omtaler fra Google, skrevet av ordrett (emoji tatt bort). Oppdater når nye omtaler kommer.
// Google: 10 omtaler, 5,0 per 2026-10-22. Én av dem har bare stjerner og ingen tekst, så 9 kort.
// Facebook-siden hadde 0 anbefalinger per 2026-10-12. Legg dem til med source: "facebook" når de finnes.
const GOOGLE_PLACE_ID = "ChIJodB0sEZBQUYRIsOoGnhHC8A";
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
export const FACEBOOK_URL = "https://www.facebook.com/61592634265932";
export const FACEBOOK_REVIEWS_URL = `${FACEBOOK_URL}/reviews`;

export const GOOGLE_RATING = { score: "5,0", count: 10 };

type Source = "google" | "facebook";
type Review = { name: string; text: string; source: Source };

const REVIEWS: Review[] = [
  {
    name: "Arild A",
    source: "google",
    text: "Dette var akkurat det Nesodden trengte! Bestillingen ble levert rett på døren. Rask service, god kommunikasjon og hyggelig levering. Kommer definitivt til å bruke KjørNesodden igjen",
  },
  {
    name: "Anne Hedvig V",
    source: "google",
    text: "Fantastisk service! Rask levering, hyggelig sjåfør og maten kom varm. Veldig praktisk med en lokal leveringstjeneste på Nesodden. Anbefales på det sterkeste!",
  },
  {
    name: "Sidra H",
    source: "google",
    text: "Fantastisk service, god mat og rask levering! Veldig fornøyd og anbefaler KjørNesodden på det varmeste.",
  },
  {
    name: "Taqwa",
    source: "google",
    text: "Super tjeneste! Alt gikk som det skulle, og leveringen var rask og enkel. Veldig fornøyd.",
  },
  {
    name: "XXDAA A",
    source: "google",
    text: "Kjempefornøyd! Hyggelige folk og veldig greit å kunne få maten levert hjem. Kommer til å bruke dem igjen.",
  },
  {
    name: "Google-bruker",
    source: "google",
    text: "Veldig fornøyd med KjørNesodden! Enkel bestilling, rask levering og hyggelig service. Veldig fint å ha et slikt tilbud her på Nesodden. Anbefales!",
  },
  {
    name: "Bvvh T",
    source: "google",
    text: "Fantastisk service! Veldig hyggelige folk, rask levering og god kommunikasjon. Utrolig praktisk å ha en slik tjeneste her på Nesodden! Anbefales på det sterkeste!",
  },
  {
    name: "Abdulrahman G",
    source: "google",
    text: "Har bare positive ting å si. Enkelt å bestille, god oppfølging og en tjeneste som gjør hverdagen litt lettere.",
  },
  {
    name: "Seba Z",
    source: "google",
    text: "Bra jobb dere",
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
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const width = card ? card.getBoundingClientRect().width + 18 : el.clientWidth;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews-head">
        <h2 id="reviews-title">{title}</h2>
        <div className="reviews-head-side">
          <ReviewsBadge />
          <div className="reviews-nav">
            <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Forrige omtaler">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Flere omtaler">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <ul className="reviews-track" ref={track} aria-label="Omtaler fra kunder, bla sidelengs for flere">
        {REVIEWS.map((r) => {
          const s = SOURCE[r.source];
          return (
            <li key={r.name}>
              <a
                className={`review-card review-${r.source}`}
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
            </li>
          );
        })}
      </ul>
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