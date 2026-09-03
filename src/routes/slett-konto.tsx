import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/slett-konto")({
  head: () => ({
    meta: [
      { title: "Slett konto – KjørNesodden" },
      {
        name: "description",
        content:
          "Slik sletter du KjørNesodden-kontoen din og tilknyttede personopplysninger.",
      },
      {
        property: "og:title",
        content: "Slett konto – KjørNesodden",
      },
      {
        property: "og:description",
        content:
          "Informasjon om sletting av KjørNesodden-konto og personopplysninger.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kjornesodden.vercel.app/slett-konto" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://kjornesodden.vercel.app/slett-konto",
      },
    ],
  }),

  component: SlettKonto,
});


function SlettKonto() {
  return (
    <div className="kn-root about-page">
      <section className="hero about-hero">
        <TopBar active="delete" />

        <div className="about-intro">
          <span className="about-eyebrow">
            KJØRNESODDEN-KONTO
          </span>

          <h1>Slett kontoen din</h1>

          <p>
            Du kan når som helst be om å få KjørNesodden-kontoen din
            og tilknyttede personopplysninger slettet.
          </p>
        </div>
      </section>


      <main className="about-content">
        <section className="about-section about-overview-grid">

          <article className="about-panel about-panel-large">
            <span className="about-panel-label">
              Alternativ 1
            </span>

            <h2>Slett kontoen direkte i appen</h2>

            <p className="about-panel-copy">
              Den enkleste måten er å slette kontoen fra KjørNesodden-appen.
            </p>


            <div className="service-columns">
              <div>
                <h3>Steg 1</h3>
                <p>Logg inn i KjørNesodden-appen.</p>
              </div>

              <div>
                <h3>Steg 2</h3>
                <p>Åpne Profil og velg «Slett konto».</p>
              </div>

              <div>
                <h3>Steg 3</h3>
                <p>
                  Bekreft slettingen med passordet ditt og velg
                  «Slett permanent».
                </p>
              </div>
            </div>
          </article>


          <aside className="about-panel contact-panel">
            <span className="about-panel-label">
              Alternativ 2
            </span>

            <h2>Får du ikke logget inn?</h2>

            <p>
              Hvis du ikke har tilgang til appen eller kontoen din,
              kan du sende oss en forespørsel om kontosletting på e-post.
            </p>

            <a
              className="contact-button"
              href="mailto:kjrnesodden@gmail.com?subject=Slett%20KjørNesodden-konto"
            >
              kjrnesodden@gmail.com
            </a>

            <p>
              Skriv gjerne e-postadressen som er knyttet til kontoen,
              slik at vi kan identifisere riktig konto.
            </p>
          </aside>
        </section>


        <section className="about-section about-secondary-grid">

          <article className="about-panel">
            <span className="about-panel-label">
              Hva blir slettet?
            </span>

            <h2>Data knyttet til kundekontoen</h2>

            <p>
              Når kundekontoen slettes, slettes kontoen og
              personopplysninger som er lagret i Firebase for kontoen.
            </p>

            <div className="service-columns">
              <div>
                <h3>Profil</h3>
                <p>Navn</p>
                <p>E-postadresse</p>
                <p>Telefonnummer</p>
                <p>Leveringsadresse</p>
              </div>

              <div>
                <h3>Bestillingsdata</h3>
                <p>
                  Tilknyttede bestillingsdata i Firebase slettes sammen
                  med kontoen.
                </p>
              </div>
            </div>
          </article>


          <article className="about-panel">
            <span className="about-panel-label">
              Bestillinger
            </span>

            <h2>Midlertidige leveringsmeldinger</h2>

            <p>
              Opplysninger som brukes for å gjennomføre en aktiv levering,
              som navn, telefonnummer, adresse og bestillingsinformasjon,
              brukes kun for å behandle leveringen.
            </p>

            <p>
              Slike bestillingsmeldinger slettes etter at bestillingen
              er levert.
            </p>
          </article>
        </section>


        <section className="about-section">
          <article className="about-panel">
            <span className="about-panel-label">
              Viktig
            </span>

            <h2>Sletting kan ikke angres</h2>

            <p>
              Når kontoen er slettet, kan den ikke gjenopprettes.
              Hvis du ønsker å bruke KjørNesodden igjen senere,
              må du opprette en ny konto.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}