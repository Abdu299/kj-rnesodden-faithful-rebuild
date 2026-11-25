// SEO-tekst for restaurantsidene: /restauranter/<slug>.
// Navn, adresse, meny og åpningstider hentes fra catalog.json.
// Her ligger det som er eget for hver side: adresse, søkenavn, innledning og egne spørsmål.
// Bare fakta vi kan stå for. Ikke skriv noe her som restauranten ikke har bekreftet.
// Nytt sted i catalog.json? Legg det til her og i public/sitemap.xml. Testene sier fra hvis noe mangler.

export const places = [
  {
    id: "signalen",
    slug: "signalen",
    // Kartverket 2026-11-25
    address: { street: "Tangenveien 3", postalCode: "1450", locality: "Nesoddtangen", lat: 59.87072, lon: 10.65581 },
    seoName: "Signalen Nesodden",
    dish: "Pizza",
    intro:
      "Bestill pizza fra Signalen Sjøbad på nett og få den kjørt hjem på Nesodden. Signalen ligger ved sjøen i Tangenveien 3 på Nesoddtangen og lager napolitansk pizza, pasta og kjøttretter. Takeaway-menyen har åtte pizzaer, tre pasta- og kjøttretter og drikke, og alle pizzaene kan lages glutenvennlige. Restauranten holder stengt på mandager. Levering koster 100 kr til Tangen og 100 kr til Hellvik, Varden og Bjørnemyr, og du betaler når maten kommer.",
    website: "https://www.signal1.no/",
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
    // Kartverket 2026-11-25
    address: { street: "Kapellveien 84", postalCode: "1452", locality: "Nesoddtangen", lat: 59.84952, lon: 10.65877 },
    seoName: "Tonys Sushi Nesodden",
    dish: "Sushi og thaimat",
    intro:
      "Bestill sushi og thaimat fra Tonys på nett og få det kjørt hjem på Nesodden. Tonys Sushi og Thai holder til på Flaskebekk senter i Kapellveien 84. Menyen har både sushi, sashimi og ferdige sett, og thairetter som thaisalat og varme hovedretter. Du kan blande sushi og thai i samme bestilling, og du betaler når maten er levert.",
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
    // Kartverket 2026-11-25
    address: { street: "Kapellveien 2", postalCode: "1452", locality: "Nesoddtangen", lat: 59.84545, lon: 10.67066 },
    seoName: "JAFS Nesodden",
    dish: "Burger og kebab",
    intro:
      "Bestill burger, kebab og fish & chips fra JAFS på nett og få maten kjørt hjem på Nesodden. JAFS Nesodden ligger i Kapellveien 2 på Nesoddtangen. Her finner du hele ta med-menyen med priser, fra enkle burgere til menyer med pommes frites og mineralvann.",
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
    // Kartverket 2026-11-25
    address: { street: "Vestveien 51", postalCode: "1452", locality: "Nesoddtangen", lat: 59.85592, lon: 10.66082 },
    seoName: "Jonathan Sushi Nesodden",
    dish: "Sushi",
    intro:
      "Bestill sushi fra Jonathan Sushi på nett og få den kjørt hjem på Nesodden. Jonathan Sushi ligger i Vestveien 51 på Nesoddtangen og lager sushi, bao og varme retter. Menyen har uramaki, nigiri, sashimi, futomaki og familiepakker, med samme priser som i restaurantens egen nettbutikk.",
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
    // Kartverket 2026-11-25
    address: { street: "Kapellveien 84", postalCode: "1452", locality: "Nesoddtangen", lat: 59.84952, lon: 10.65877 },
    seoName: "Flaskebekk Bistro Nesodden",
    dish: "Kinesisk mat og dim sum",
    intro:
      "Bestill kinesisk mat og dim sum fra Flaskebekk Bistro på nett og få maten kjørt hjem på Nesodden. Flaskebekk Bistro ligger i Kapellveien 84. Takeaway-menyen er stor: kinesiske retter, kombinasjonsretter, kokkens anbefalinger, norske retter og egen barnemeny, med priser på alt.",
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
    // Kartverket 2026-11-25
    address: { street: "Tangenveien 129", postalCode: "1450", locality: "Nesoddtangen", lat: 59.86027, lon: 10.66545 },
    seoName: "O' Sole Mio Nesodden",
    dish: "Pizza",
    intro:
      "Bestill pizza fra O' Sole Mio på nett og få den kjørt hjem på Nesodden. O' Sole Mio ligger i Tangenveien 129 på Nesoddtangen og lager ekte napolitansk pizza. Menyen har 16 klassiske pizzaer med tomatsaus, seks hvite pizzaer uten tomatsaus, hjemmelaget tiramisù og italiensk brus. Husets egen pizza, O' Sole Mio, har skorpe fylt med fersk ricotta. Levering koster 100 kr til Tangen og 100 kr til Hellvik, Varden og Bjørnemyr, og du betaler når pizzaen kommer.",
    website: "",
    faq: [
      {
        q: "Hva koster pizza fra O' Sole Mio?",
        a: "Pizzaene koster fra 130 kr for Napoletana til 240 kr for husets pizza O' Sole Mio. De fleste ligger mellom 190 og 220 kr. Levering kommer i tillegg og avhenger av hvor du bor.",
      },
      {
        q: "Har O' Sole Mio pizza uten tomatsaus?",
        a: "Ja. Seks hvite pizzaer er laget uten tomatsaus, blant annet Quattro Formaggi, Al Pesto og Salsiccia e Broccoli.",
      },
      {
        q: "Har O' Sole Mio åpent på mandag?",
        a: "Nei. O' Sole Mio har stengt mandag og tirsdag. Onsdag til lørdag kan du bestille fra 15.30, og søndag fra 15.",
      },
      {
        q: "Har O' Sole Mio pizza uten ost?",
        a: "Ja. Napoletana er laget uten mozzarella, med tomatsaus, hvitløk, oregano og basilikum.",
      },
    ],
  },
  {
    id: "fagerstrand",
    slug: "fagerstrand-grill",
    // Kartverket 2026-11-25
    address: { street: "Myklerudveien 5", postalCode: "1454", locality: "Fagerstrand", lat: 59.73803, lon: 10.59562 },
    seoName: "Fagerstrand Grill Nesodden",
    dish: "Pizza, burger og kebab",
    intro:
      "Bestill pizza, burger og kebab fra Fagerstrand Grill på nett og få maten kjørt hjem på Nesodden. Fagerstrand Grill er gatekjøkkenet i Myklerudveien 5 på Fagerstrand. Menyen har ni pizzaer, burgere fra 100 til 320 gram, kebab i tre størrelser og egen barnemeny. Det er åpent mandag til onsdag fra 14 til 21 og torsdag til søndag fra 11 til 21. Levering koster 250 kr til Fagerstrand, 150 kr til Fjellstrand, Svestad og Blylaget, 100 kr til Hellvik, Varden, Bjørnemyr, Alværn og Fjordvangen og 100 kr til Tangen.",
    website: "https://fagerstrandgrill.no",
    faq: [
      {
        q: "Når har Fagerstrand Grill åpent?",
        a: "Mandag til onsdag fra 14 til 21, og torsdag til søndag fra 11 til 21.",
      },
      {
        q: "Hvilke størrelser finnes burgerne i?",
        a: "Burgerne finnes i 100, 160, 200 og 320 gram. En hamburger koster fra 110 kr.",
      },
      {
        q: "Har Fagerstrand Grill barnemeny?",
        a: "Ja. Hamburger, fiskemiddag eller nuggets med pommes frites koster 140 kr.",
      },
    ],
  },
];

export const placeBySlug = (slug) => places.find((place) => place.slug === slug);
export const placeById = (id) => places.find((place) => place.id === id);
export const placePath = (place) => `/restauranter/${place.slug}`;
