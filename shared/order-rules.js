export const NESODDEN_MUNICIPALITY = "3212";
export const zones = [
  { id: "tangen", name: "Tangen", fee: 75 },
  { id: "hellvik", name: "Hellvik / Varden", fee: 100 },
  { id: "bjornemyr", name: "Bjørnemyr", fee: 100 },
  { id: "alvaern", name: "Alværn / Fjordvangen / Fjellstrand", fee: 100 },
  { id: "svestad", name: "Svestad / Blylaget", fee: 150 },
  { id: "fagerstrand", name: "Fagerstrand", fee: 175 },
];

// Same geographical delivery-area anchors as the requested reference site.
// These are business pricing areas, not official postal-code boundaries.
const anchors = [
  [59.8588, 10.6634, "tangen"],
  [59.8604, 10.6542, "tangen"],
  [59.8614, 10.6718, "tangen"],
  [59.8507, 10.6777, "hellvik"],
  [59.857, 10.6608, "tangen"],
  [59.8343, 10.6418, "bjornemyr"],
  [59.8274, 10.6355, "bjornemyr"],
  [59.8445, 10.6912, "hellvik"],
  [59.8416, 10.6738, "hellvik"],
  // Varden, including Vardeveien's Nesoddtangen postal addresses.
  [59.853815, 10.652775, "hellvik"],
  [59.845802, 10.651148, "hellvik"],
  [59.839352, 10.645170, "hellvik"],
  [59.8209, 10.6278, "alvaern"],
  [59.8292, 10.6952, "alvaern"],
  [59.8331, 10.6941, "alvaern"],
  [59.7952, 10.6083, "alvaern"],
  [59.8064, 10.6256, "alvaern"],
  [59.814, 10.6768, "alvaern"],
  [59.7912, 10.7054, "alvaern"],
  [59.7773, 10.6907, "alvaern"],
  [59.7779, 10.7059, "alvaern"],
  // Keep Svestad and Blylaget separate from the new Fagerstrand price.
  [59.77514, 10.59449, "svestad"],
  [59.7648, 10.63744, "svestad"],
  [59.77791, 10.70588, "svestad"],
  [59.7375, 10.594, "fagerstrand"],
  [59.743, 10.6127, "fagerstrand"],
  [59.7505, 10.6082, "fagerstrand"],
  [59.7604, 10.5842, "fagerstrand"],
  [59.7116, 10.6244, "fagerstrand"],
];

// Business delivery area interpreted from the owner's 24 October 2026 sketch.
// The northern edge runs south of Fjellstrand centre and curves north towards
// the east coast. Alværn, Fjellstrand centre and Fjordvangen remain 100 kr.
// These are approximate hand-drawn business boundaries, not postal boundaries.
// Fagerstrand is now priced separately at 175 kr within this southern area.
// Points are [latitude, longitude]; postcode must never override this area.
const marked150Area = [
  [59.792, 10.575],
  [59.792, 10.63],
  [59.793, 10.66],
  [59.800, 10.70],
  [59.806, 10.725],
  [59.778, 10.731],
  [59.750, 10.713],
  [59.747, 10.68],
  [59.732, 10.65],
  [59.733, 10.625],
  [59.722, 10.59],
  [59.730, 10.57],
];

function insideMarked150Area(latitude, longitude) {
  let inside = false;
  for (let i = 0, j = marked150Area.length - 1; i < marked150Area.length; j = i++) {
    const [ay, ax] = marked150Area[j];
    const [by, bx] = marked150Area[i];
    const cross = (longitude - ax) * (by - ay) - (latitude - ay) * (bx - ax);
    if (
      Math.abs(cross) < 1e-12 &&
      longitude >= Math.min(ax, bx) && longitude <= Math.max(ax, bx) &&
      latitude >= Math.min(ay, by) && latitude <= Math.max(ay, by)
    ) return true;
    if (
      (ay > latitude) !== (by > latitude) &&
      longitude < ax + ((latitude - ay) * (bx - ax)) / (by - ay)
    ) inside = !inside;
  }
  return inside;
}

export function deliveryZone(latitude, longitude, postalCode, postalPlace) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  let closest = null;
  let distance = Infinity;
  for (const [lat, lon, zone] of anchors) {
    const dy = latitude - lat;
    const dx = (longitude - lon) * Math.cos((latitude * Math.PI) / 180);
    const d = dy * dy + dx * dx;
    if (d < distance) {
      distance = d;
      closest = zone;
    }
  }
  // Fagerstrand's geographic area takes priority over the old 150 kr polygon
  // and postal labels. Svestad and Blylaget retain their existing 150 kr fee.
  if (closest === "fagerstrand")
    return zones.find((zone) => zone.id === "fagerstrand");
  if (insideMarked150Area(latitude, longitude))
    return zones.find((zone) => zone.id === "svestad");
  // Outside the marked area, keep the established Bjørnemyr postal rule.
  if (
    (String(postalCode) === "1453" ||
      String(postalPlace).toLocaleUpperCase("nb-NO") === "BJØRNEMYR")
  )
    return zones.find((zone) => zone.id === "bjornemyr");
  return zones.find((zone) => zone.id === closest) ?? null;
}

export const dayNames = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
export const formatTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}.${String(minutes % 60).padStart(2, "0")}`;
export function osloTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
    minute: Number(get("hour")) * 60 + Number(get("minute")),
  };
}
function osloDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function openingStatus(restaurant, date = new Date()) {
  if (
    restaurant.holiday &&
    osloDate(date) >= restaurant.holiday.from &&
    osloDate(date) < restaurant.holiday.until
  ) {
    const reopen = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long" }).format(
      new Date(`${restaurant.holiday.until}T12:00:00Z`),
    );
    return { open: false, known: true, text: `Feriestengt · åpner ${reopen}` };
  }
  if (!restaurant.hours)
    return { open: false, known: false, text: "Meny og åpningstider må bekreftes" };
  const { day, minute } = osloTime(date);
  const today = restaurant.hours[day];
  if (today && minute >= today[0] && minute < today[1]) {
    return { open: true, known: true, text: `Åpent nå til ${formatTime(today[1])}` };
  }
  if (today && minute < today[0])
    return { open: false, known: true, text: `Stengt · åpner ${formatTime(today[0])}` };
  for (let offset = 1; offset <= 7; offset++) {
    const next = restaurant.hours[(day + offset) % 7];
    if (next)
      return {
        open: false,
        known: true,
        text: `Stengt · åpner ${offset === 1 ? "i morgen" : dayNames[(day + offset) % 7].toLowerCase()} ${formatTime(next[0])}`,
      };
  }
  return { open: false, known: true, text: "Stengt" };
}
