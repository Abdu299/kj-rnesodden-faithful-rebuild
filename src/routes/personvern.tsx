import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/personvern")({
  head: () => ({
    meta: [
      { title: "Personvernerklæring – KjørNesodden" },
      {
        name: "description",
        content:
          "Personvernerklæring for KjørNesodden. Les hvordan vi behandler personopplysninger i appen og leveringstjenesten.",
      },
      {
        property: "og:title",
        content: "Personvernerklæring – KjørNesodden",
      },
      {
        property: "og:description",
        content:
          "Informasjon om hvordan KjørNesodden samler inn, bruker, deler og sletter personopplysninger.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://kjornesodden.vercel.app/personvern",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://kjornesodden.vercel.app/personvern",
      },
    ],
  }),

  component: Personvern,
});


function Personvern() {
  return (
    <div className="kn-root about-page">
      <section className="hero about-hero">
        <TopBar active="privacy" />

        <div className="about-intro">
          <span className="about-eyebrow">
            PERSONVERN
          </span>

          <h1>Personvernerklæring</h1>

          <p>
            Denne personvernerklæringen forklarer hvordan KjørNesodden
            behandler personopplysninger når du bruker appen og
            leveringstjenesten vår.
          </p>
        </div>
      </section>


      <main className="about-content">

        <section className="about-section about-overview-grid">
          <article className="about-panel about-panel-large">
            <span className="about-panel-label">
              Behandlingsansvarlig
            </span>

            <h2>KjørNesodden</h2>

            <p className="about-panel-copy">
              KjørNesodden er ansvarlig for behandlingen av
              personopplysninger som beskrives i denne erklæringen.
            </p>

            <div className="service-columns">
              <div>
                <h3>Kontakt</h3>
                <p>
                  E-post:
                  {" "}
                  <a href="mailto:kjrnesodden@gmail.com">
                    kjrnesodden@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3>Tjeneste</h3>
                <p>
                  KjørNesodden-appen og leveringstjenesten på Nesodden.
                </p>
              </div>
            </div>
          </article>


          <aside className="about-panel contact-panel">
            <span className="about-panel-label">
              Dine valg
            </span>

            <h2>Kontroll over egne data</h2>

            <p>
              Du kan oppdatere navn, telefonnummer og leveringsadresse
              fra Profil i appen.
            </p>

            <p>
              Du kan også slette kundekontoen permanent direkte i appen.
            </p>

            <a
              className="contact-button"
              href="/slett-konto"
            >
              Les om kontosletting
            </a>
          </aside>
        </section>


        <section className="about-section">
          <article className="about-panel">
            <span className="about-panel-label">
              Opplysninger vi behandler
            </span>

            <h2>Hvilke personopplysninger samler vi inn?</h2>

            <div className="service-columns">
              <div>
                <h3>Konto og profil</h3>
                <p>Navn</p>
                <p>E-postadresse</p>
                <p>Telefonnummer</p>
                <p>Leveringsadresse</p>
              </div>

              <div>
                <h3>Bestilling</h3>
                <p>
                  Restaurant eller butikk du bestiller fra
                </p>
                <p>
                  Produkter og annen bestillingsinformasjon
                </p>
                <p>
                  Opplysninger som er nødvendige for å gjennomføre
                  leveringen
                </p>
              </div>
            </div>

            <p>
              Vi samler ikke inn betalingskortinformasjon i appen.
            </p>
          </article>
        </section>


        <section className="about-section about-secondary-grid">
          <article className="about-panel">
            <span className="about-panel-label">
              Formål
            </span>

            <h2>Hvorfor bruker vi opplysningene?</h2>

            <p>
              Vi bruker personopplysningene for å opprette og administrere
              kundekontoen din, behandle bestillinger, kontakte deg om
              bestillingen og levere varer til riktig adresse.
            </p>

            <p>
              Kontaktinformasjonen kan også brukes når det er nødvendig
              for å avklare en bestilling eller levering.
            </p>
          </article>


          <article className="about-panel">
            <span className="about-panel-label">
              Behandlingsgrunnlag
            </span>

            <h2>Grunnlaget for behandlingen</h2>

            <p>
              Opplysninger som er nødvendige for å opprette konto og
              gjennomføre en bestilling behandles for å levere tjenesten
              du ber om.
            </p>

            <p>
              Der behandling er nødvendig for å oppfylle rettslige
              forpliktelser, kan opplysninger oppbevares så lenge dette
              er påkrevd.
            </p>
          </article>
        </section>


        <section className="about-section">
          <article className="about-panel">
            <span className="about-panel-label">
              Tjenesteleverandører
            </span>

            <h2>Hvem kan opplysningene deles med?</h2>

            <p>
              Vi bruker eksterne tekniske tjenester for å drifte appen
              og gjennomføre bestillinger. Opplysninger deles bare når
              det er nødvendig for formålet.
            </p>

            <div className="service-columns">
              <div>
                <h3>Firebase / Google</h3>
                <p>
                  Firebase Authentication brukes til innlogging og
                  kontoer. Cloud Firestore brukes til å lagre
                  kontoinformasjon, restaurantdata, produkter og
                  bestillingsdata.
                </p>
              </div>

              <div>
                <h3>Vercel</h3>
                <p>
                  Vercel brukes til å drifte KjørNesodden-nettsiden og
                  bestillingsendepunktet som appen kommuniserer med.
                </p>
              </div>

              <div>
                <h3>Telegram</h3>
                <p>
                  Ved bestilling sendes nødvendige leveringsopplysninger,
                  som navn, telefonnummer, leveringsadresse og
                  bestillingsinformasjon, til vår interne
                  bestillingskanal i Telegram slik at leveringen kan
                  håndteres.
                </p>
              </div>
            </div>
          </article>
        </section>


        <section className="about-section about-secondary-grid">
          <article className="about-panel">
            <span className="about-panel-label">
              Lagring og sletting
            </span>

            <h2>Hvor lenge lagrer vi data?</h2>

            <p>
              Konto- og profilopplysninger lagres så lenge du har en
              aktiv kundekonto, med mindre vi er rettslig forpliktet til
              å oppbevare enkelte opplysninger lenger.
            </p>

            <p>
              Når du sletter kundekontoen i appen, slettes profilen,
              Firebase Authentication-kontoen og tilknyttede
              bestillingsdata som er lagret i Firebase.
            </p>

            <p>
              Midlertidige bestillingsmeldinger som brukes for å
              gjennomføre en levering slettes etter at bestillingen er
              levert.
            </p>
          </article>


          <article className="about-panel">
            <span className="about-panel-label">
              Sikkerhet
            </span>

            <h2>Hvordan beskytter vi opplysningene?</h2>

            <p>
              Vi bruker Firebase Authentication for innlogging og
              Firestore-sikkerhetsregler for å begrense hvilke data
              kunder, restauranter og administratorer kan lese eller
              endre.
            </p>

            <p>
              Kommunikasjon mellom appen og de eksterne tjenestene våre
              skjer over HTTPS.
            </p>
          </article>
        </section>


        <section className="about-section">
          <article className="about-panel">
            <span className="about-panel-label">
              Dine rettigheter
            </span>

            <h2>Du kan kontakte oss om personopplysningene dine</h2>

            <p>
              Du kan be om informasjon om hvilke personopplysninger vi
              behandler om deg, og be om retting eller sletting der
              vilkårene for dette er oppfylt.
            </p>

            <p>
              Du kan også be om begrensning av behandlingen eller
              protestere mot behandling der dette følger av gjeldende
              personvernregler.
            </p>

            <p>
              For spørsmål eller forespørsler, kontakt oss på
              {" "}
              <a href="mailto:kjrnesodden@gmail.com">
                kjrnesodden@gmail.com
              </a>.
            </p>

            <p>
              Du har også rett til å klage på behandlingen av
              personopplysninger til Datatilsynet.
            </p>
          </article>
        </section>


        <section className="about-section">
          <article className="about-panel">
            <span className="about-panel-label">
              Endringer
            </span>

            <h2>Oppdatering av personvernerklæringen</h2>

            <p>
              Vi kan oppdatere denne personvernerklæringen dersom
              tjenesten eller behandlingen av personopplysninger endres.
              Den nyeste versjonen vil være tilgjengelig på denne siden.
            </p>

            <p>
              Sist oppdatert: 3. september 2026.
            </p>
          </article>
        </section>

      </main>
    </div>
  );
}
