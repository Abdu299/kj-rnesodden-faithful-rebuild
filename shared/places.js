// SEO-tekst for restaurantsidene: /restauranter/<slug>.
// Navn, adresse, meny og åpningstider hentes fra catalog.json.
// Her ligger det som er eget for hver side: adresse, søkenavn, innledning og egne spørsmål.
// Bare fakta vi kan stå for. Ikke skriv noe her som restauranten ikke har bekreftet.
// Nytt sted i catalog.json? Legg det til her og i public/sitemap.xml. Testene sier fra hvis noe mangler.

export const places = [
  {
    id: "signalen",
    slug: "signalen",
    seoName: "Signalen Nesodden",
    intro:
      "Signalen Sjøbad ligger ved sjøen i Tangenveien 3 på Nesoddtangen og lager napolitansk pizza. Takeaway-menyen har sju pizzaer og drikke, og alle pizzaene kan lages glutenvennlige. Bestill her, så henter vi pizzaen og kjører den hjem til deg. Bor du på Tangen, Bjørnemyr eller Helvik, koster leveringen 75 kr.",
    website: "",
    faq: [
      {
        q: "Kan pizzaen fra Signalen lages glutenvennlig?",
        a: "Ja. Alle pizzaene kan lages glutenvennlige for 40 kr ekstra. Glutenvennlig er ikke det samme som fri for spor av gluten.",
      },
    ],
  },
  {
    id: "tonys",
    slug: "tonys-sushi",
    seoName: "Tonys Sushi Nesodden",
    intro:
      "Tonys Sushi og Thai holder til på Flaskebekk senter i Kapellveien 84. Menyen har både sushi, sashimi og ferdige sett, og thairetter som thaisalat og varme hovedretter. Du kan blande sushi og thai i samme bestilling. Vi henter maten hos Tonys og kjører den hjem til deg, og du betaler når den er levert.",
    website: "https://tonyssushi.no",
    faq: [
      {
        q: "Kan jeg bestille sushi og thaimat fra Tonys i samme bestilling?",
        a: "Ja. Alt på menyen kommer fra samme kjøkken, så du legger sushi og thairetter i samme kurv.",
      },
    ],
  },
  {
    id: "jafs",
    slug: "jafs",
    seoName: "JAFS Nesodden",
    intro:
      "JAFS Nesodden ligger i Kapellveien 2 på Nesoddtangen og lager burger, kebab og fish & chips. Her finner du hele ta med-menyen med priser, fra enkle burgere til menyer med pommes frites og mineralvann. Bestill, så henter vi maten og kjører den hjem til deg på Nesodden.",
    website: "",
    faq: [
      {
        q: "Hva er med i en meny fra JAFS?",
        a: "Menyene fra JAFS Nesodden inkluderer pommes frites og mineralvann.",
      },
      {
        q: "Hvor finner jeg allergener for JAFS?",
        a: "Allergenene står på jafs.no/allergener. Er du usikker, spør restauranten før du bestiller.",
      },
    ],
  },
  {
    id: "jonathan",
    slug: "jonathan-sushi",
    seoName: "Jonathan Sushi Nesodden",
    intro:
      "Jonathan Sushi ligger i Vestveien 51 på Nesoddtangen og lager sushi, bao og varme retter. Menyen har uramaki, nigiri, sashimi, futomaki og familiepakker, med samme priser som i restaurantens egen nettbutikk. Bestill her, så henter vi maten og kjører den hjem til deg.",
    website: "",
    faq: [
      {
        q: "Hvor sent kan jeg bestille fra Jonathan Sushi?",
        a: "Kjøkkenet stenger 30 minutter før restauranten. Vi tar imot den siste bestillingen kl. 19.15.",
      },
      {
        q: "Hvordan velger jeg fiskemiks eller bao-type?",
        a: "Skriv det i beskjedfeltet når du sender bestillingen, så tar vi det med til restauranten.",
      },
    ],
  },
  {
    id: "bistro",
    slug: "flaskebekk-bistro",
    seoName: "Flaskebekk Bistro Nesodden",
    intro:
      "Flaskebekk Bistro ligger i Kapellveien 84 og lager kinesisk mat, dim sum og middag. Takeaway-menyen er stor: kinesiske retter, kombinasjonsretter, kokkens anbefalinger, norske retter og egen barnemeny. Hele menyen står her med priser. Bestill, så henter vi maten og kjører den hjem til deg.",
    website: "",
    faq: [
      {
        q: "Har Flaskebekk Bistro dim sum?",
        a: "Ja. Menyen har en egen del med dim sum, og du bestiller dem på samme måte som de andre rettene.",
      },
      {
        q: "Har Flaskebekk Bistro åpent på mandag?",
        a: "Nei. Restauranten har stengt på mandager, så da kan vi ikke hente derfra.",
      },
    ],
  },
  {
    id: "osolemio",
    slug: "o-sole-mio",
    seoName: "O' Sole Mio Nesodden",
    intro:
      "O' Sole Mio ligger i Tangenveien 129 på Nesoddtangen og lager napolitansk pizza. Menyen ligger ikke på nett ennå, så du skriver hva du vil ha. Vi sjekker menyen og prisen med restauranten og ringer deg før vi bestiller. Så henter vi pizzaen og kjører den hjem til deg. Bor du på Tangen, Bjørnemyr eller Helvik, koster leveringen 75 kr.",
    website: "",
    faq: [
      {
        q: "Hvordan bestiller jeg fra O' Sole Mio når menyen ikke er på nett?",
        a: "Skriv hvilke pizzaer du vil ha i skjemaet. Vi sjekker pris og om de har det, og ringer deg før vi bestiller. Du betaler ingenting før maten er levert.",
      },
    ],
  },
  {
    id: "mamagreek",
    slug: "mama-greek-kitchen",
    seoName: "Mama Greek Kitchen Fagerstrand",
    intro:
      "Mama Greek Kitchen er en gresk foodtruck på Fagerstrand. Menyen ligger ikke på nett ennå, så du skriver hva du vil ha, og vi ringer deg og bekrefter pris før vi bestiller. Så henter vi maten og kjører den hjem til deg. Levering på Fagerstrand koster 150 kr, og 75 til 100 kr lenger nord på Nesodden.",
    website: "",
    faq: [
      {
        q: "Hvordan bestiller jeg fra Mama Greek Kitchen?",
        a: "Skriv hva du vil ha i skjemaet. Vi ringer deg, bekrefter pris og henter maten ved foodtrucken på Fagerstrand.",
      },
    ],
  },
];

export const placeBySlug = (slug) => places.find((place) => place.slug === slug);
export const placeById = (id) => places.find((place) => place.id === id);
export const placePath = (place) => `/restauranter/${place.slug}`;
