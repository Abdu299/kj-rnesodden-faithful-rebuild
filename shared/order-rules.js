export const NESODDEN_MUNICIPALITY = "3212";
export const zones = [
  { id: "tangen", name: "Tangen / Bjørnemyr / Helvik", fee: 75 },
  { id: "alvaern", name: "Alværn / Fjordvangen / Fjellstrand", fee: 100 },
  { id: "fagerstrand", name: "Fagerstrand", fee: 150 },
];

// Same geographical delivery-area anchors as the requested reference site.
// These are business pricing areas, not official postal-code boundaries.
const anchors = [
  [59.8588, 10.6634, "tangen"],
  [59.8604, 10.6542, "tangen"],
  [59.8614, 10.6718, "tangen"],
  [59.8507, 10.6777, "tangen"],
  [59.857, 10.6608, "tangen"],
  [59.8343, 10.6418, "tangen"],
  [59.8445, 10.6912, "tangen"],
  [59.8416, 10.6738, "tangen"],
  [59.8209, 10.6278, "alvaern"],
  [59.8292, 10.6952, "alvaern"],
  [59.8331, 10.6941, "alvaern"],
  [59.7952, 10.6083, "alvaern"],
  [59.8064, 10.6256, "alvaern"],
  [59.814, 10.6768, "alvaern"],
  [59.7912, 10.7054, "alvaern"],
  [59.7773, 10.6907, "alvaern"],
  [59.7779, 10.7059, "alvaern"],
  [59.7375, 10.594, "fagerstrand"],
  [59.743, 10.6127, "fagerstrand"],
  [59.7505, 10.6082, "fagerstrand"],
  [59.7604, 10.5842, "fagerstrand"],
  [59.7116, 10.6244, "fagerstrand"],
];

export function deliveryZone(latitude, longitude) {
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
export function openingStatus(restaurant, date = new Date()) {
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
