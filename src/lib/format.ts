export function formatPrice(price: number): string {
  return `${price.toLocaleString("fa-IR")} تومان`;
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
