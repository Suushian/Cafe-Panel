export const ORDER_STATUSES = ["open", "paid", "cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  open: "باز",
  paid: "پرداخت‌شده",
  cancelled: "لغو‌شده",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  open: "bg-primary/10 text-primary",
  paid: "bg-green-50 text-green-700",
  cancelled: "bg-border text-text-muted",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
