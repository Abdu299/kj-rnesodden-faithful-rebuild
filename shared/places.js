// SEO-sider for hvert sted: /restauranter/<slug>.
// Navn, adresse, meny og åpningstider hentes fra catalog.json.
// Her ligger bare det som er eget for nettsiden: adresse, tittel, søkenavn og innledning.
// Nytt sted i catalog.json? Legg til en linje her, og i public/sitemap.xml. Testene sier fra hvis noe mangler.

export const places = [
  {
    id: "signalen",
    slug: "signalen",
    seoName: "Signalen Nesodden",
    intro:
      "Signalen Sjøbad ligger ved sjøen på Tangenveien 3 på Nesoddtangen og lager napolitansk pizza. Gjennom KjørNesodden kan du bestille takeaway-pizzaene og drikke, og få dem kjørt hjem.",
    website: "",
  },
  {
    id: "tonys",
    slug: "tonys-sushi",
    seoName: "Tonys Sushi og Thai Nesodden",
    intro:
      "Tonys Sushi og Thai holder til på Flaskebekk senter i Kapellveien 84. Her får du både sushi og thaimat fra samme kjøkken, og vi henter maten og kjører den hjem til deg.",
    website: "https://tonyssushi.no",
  },
  {
    id: "jafs",
    slug: "jafs",
    seoName: "JAFS Nesodden",
    intro:
      "JAFS Nesodden ligger i Kapellveien 2 på Nesoddtangen og lager burger, kebab og fish & chips. Bestill ta med-menyen her, så kjører vi den hjem til deg.",
    website: "",
  },
  {
    id: "jonathan",
    slug: "jonathan-sushi",
    seoName: "Jonathan Sushi Nesodden",
    intro:
      "Jonathan Sushi ligger i Vestveien 51 på Nesoddtangen og lager sushi, bao og varme retter. Bestill takeaway-menyen her, så henter vi den og kjører den hjem til deg.",
    website: "",
  },
  {
    id: "bistro",
    slug: "flaskebekk-bistro",
    seoName: "Flaskebekk Bistro Nesodden",
    intro:
      "Flaskebekk Bistro ligger i Kapellveien 84 og lager kinesisk mat, dim sum og middag. Hele takeaway-menyen står her med priser. Bestill, så henter vi maten og kjører den hjem til deg.",
    website: "",
  },
  {
    id: "osolemio",
    slug: "o-sole-mio",
    seoName: "O' Sole Mio Nesodden",
    intro:
      "O' Sole Mio ligger i Tangenveien 129 på Nesoddtangen og lager napolitansk pizza. Menyen ligger ikke på nett ennå. Skriv hva du vil ha, så ringer vi deg, henter maten og kjører den hjem.",
    website: "",
  },
  {
    id: "mamagreek",
    slug: "mama-greek-kitchen",
    seoName: "Mama Greek Kitchen Fagerstrand",
    intro:
      "Mama Greek Kitchen er en gresk foodtruck på Fagerstrand. Menyen ligger ikke på nett ennå. Skriv hva du vil ha, så ordner vi resten og kjører maten hjem til deg.",
    website: "",
  },
];

export const placeBySlug = (slug) => places.find((place) => place.slug === slug);
export const placeById = (id) => places.find((place) => place.id === id);
export const placePath = (place) => `/restauranter/${place.slug}`;
