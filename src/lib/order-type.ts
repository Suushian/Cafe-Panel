export const ORDER_TYPES = ["dine_in", "takeaway", "delivery"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "داخل کافه",
  takeaway: "بیرون‌بر",
  delivery: "تحویل",
};

export function isOrderType(value: string): value is OrderType {
  return (ORDER_TYPES as readonly string[]).includes(value);
}