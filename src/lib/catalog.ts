import data from "../../shared/catalog.json";

export type MenuVariant = { id: string; label: string; price: number };
export type MenuOption = { id: string; label: string; price: number };
export type MenuItem = {
  id: string;
  number: string | number | null;
  name: string;
  description: string;
  allergens: string[];
  variants: MenuVariant[];
  image: string;
  tag: string;
  isNew: boolean;
  subheading: string;
  options: MenuOption[];
};
export type Restaurant = {
  id: string;
  name: string;
  shortName: string;
  cuisine: string;
  address: string;
  phone: string;
  image: string;
  logo: string;
  banner: string;
  hours: ([number, number] | null)[] | null;
  orderingMode: "menu" | "request";
  note: string;
  sources: { label: string; url: string }[];
  verifiedAt: string;
  categories: { id: string; name: string; description: string; items: MenuItem[] }[];
};
export const restaurants = data as Restaurant[];
export const restaurantById = (id: string) => restaurants.find((r) => r.id === id);
export const itemById = (restaurant: Restaurant, id: string) =>
  restaurant.categories.flatMap((c) => c.items).find((item) => item.id === id);
export const formatKr = (amount: number) => `${amount.toLocaleString("nb-NO")} kr`;

export type CartLine = {
  itemId: string;
  variantId: string;
  optionIds: string[];
  quantity: number;
};
export type Address = {
  id: string;
  streetAddress: string;
  postalCode: string;
  postalPlace: string;
  municipality: string;
  latitude: number;
  longitude: number;
  label: string;
  zone: { id: string; name: string; fee: number };
};
export type Receipt = {
  reference: string;
  kind: "menu" | "request";
  restaurantName: string;
  fullName: string;
  address: Address;
  subtotal: number | null;
  deliveryFee: number;
  total: number | null;
  lines: {
    name: string;
    variant: string;
    options: string[];
    quantity: number;
    lineTotal: number;
  }[];
};

export function lineKey(line: Omit<CartLine, "quantity">) {
  return `${line.itemId}:${line.variantId}:${[...line.optionIds].sort().join(",")}`;
}
export function describeLine(restaurant: Restaurant, line: CartLine) {
  const item = itemById(restaurant, line.itemId);
  const variant = item?.variants.find((v) => v.id === line.variantId);
  if (!item || !variant) return null;
  const options = line.optionIds.map((id) => item.options.find((option) => option.id === id));
  if (options.some((option) => !option)) return null;
  const unitPrice = variant.price + options.reduce((sum, option) => sum + (option?.price ?? 0), 0);
  return {
    name: `${item.number ? `${item.number}. ` : ""}${item.name}`,
    variant: variant.label,
    options: options.map((option) => option!.label),
    unitPrice,
    lineTotal: unitPrice * line.quantity,
  };
}
