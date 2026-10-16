"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock3, Search, Wallet, X } from "lucide-react";
import OrderCard from "./OrderCard";
import { STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  orderType: string;
  totalPrice: number;
  discountAmount: number;
  createdAt: Date;
  customer: { name: string; subscriptionCode: string } | null;
  items: { id: string; quantity: number; unitPrice: number; menuItem: { name: string } }[];
};

type Filter = "all" | OrderStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "open", label: "باز" },
  { value: "paid", label: "پرداخت‌شده" },
  { value: "cancelled", label: "لغو‌شده" },
];

function matchesQuery(order: Order, query: string) {
  if (!query) return true;
  const searchable = [
    order.customer?.name ?? "",
    order.customer?.subscriptionCode ?? "",
    order.id,
    ...order.items.map((item) => item.menuItem.name),
  ].join(" ").toLocaleLowerCase("fa-IR");
  return searchable.includes(query.toLocaleLowerCase("fa-IR"));
}

export default function OrdersPageClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();

  const stats = useMemo(() => {
    const open = orders.filter((order) => order.status === "open").length;
    const paidOrders = orders.filter((order) => order.status === "paid");
    const paidTotal = paidOrders.reduce(
      (sum, order) => sum + Math.max(0, order.totalPrice - order.discountAmount),
      0
    );
    return { total: orders.length, open, paid: paidOrders.length, paidTotal };
  }, [orders]);

  const filtered = useMemo(
    () => orders.filter((order) =>
      (filter === "all" || order.status === filter) &&
      matchesQuery(order, normalizedQuery)
    ),
    [orders, filter, normalizedQuery]
  );

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="خلاصه سفارش‌ها" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <article className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-primary/10 text-primary shrink-0"><ClipboardList size={19} /></span>
          <div className="min-w-0"><p className="text-xs text-text-muted">کل سفارش‌ها</p><p className="mt-1 text-xl font-bold text-text tabular-nums">{stats.total.toLocaleString("fa-IR")}</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-amber-500/10 text-amber-600 shrink-0"><Clock3 size={19} /></span>
          <div className="min-w-0"><p className="text-xs text-text-muted">سفارش‌های باز</p><p className="mt-1 text-xl font-bold text-text tabular-nums">{stats.open.toLocaleString("fa-IR")}</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-success/10 text-success shrink-0"><CheckCircle2 size={19} /></span>
          <div className="min-w-0"><p className="text-xs text-text-muted">پرداخت‌شده</p><p className="mt-1 text-xl font-bold text-text tabular-nums">{stats.paid.toLocaleString("fa-IR")}</p></div>
        </article>
        <article className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-sky-500/10 text-sky-600 shrink-0"><Wallet size={19} /></span>
          <div className="min-w-0"><p className="text-xs text-text-muted">مجموع سفارش‌های پرداخت‌شده</p><p className="mt-1 text-base font-bold text-text tabular-nums">{formatPrice(stats.paidTotal)}</p></div>
        </article>
      </section>

      <section className="card flex flex-col gap-4" aria-label="جست‌وجو و فیلتر سفارش‌ها">
        <div className="flex items-center gap-3 rounded-card-sm border border-border bg-bg px-3 py-2.5 focus-within:border-primary/50 transition-colors">
          <Search size={17} className="text-text-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو بر اساس مشتری، کد اشتراک، شناسه یا آیتم..."
            aria-label="جست‌وجو در سفارش‌ها"
            className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-soft"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="پاک کردن جست‌وجو" className="rounded-md p-1 text-text-muted hover:text-text"><X size={15} /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر وضعیت سفارش">
          {FILTERS.map((item) => {
            const active = filter === item.value;
            const count = item.value === "all" ? orders.length : orders.filter((order) => order.status === item.value).length;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.value)}
                className={`inline-flex items-center gap-2 rounded-pill border px-3 py-2 text-xs font-medium transition-colors ${active ? "border-primary bg-primary text-white" : "border-border bg-bg text-text-muted hover:border-primary/40 hover:text-primary"}`}
              >
                <span>{item.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 tabular-nums ${active ? "bg-white/20 text-white" : "bg-bg2 text-text-muted"}`}>{count.toLocaleString("fa-IR")}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text">فهرست سفارش‌ها</h2>
        <p className="text-xs text-text-muted tabular-nums">{filtered.length.toLocaleString("fa-IR")} از {orders.length.toLocaleString("fa-IR")} سفارش</p>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-10 px-5 text-center">
          <p className="text-sm font-medium text-text">سفارشی پیدا نشد</p>
          <p className="mt-2 text-xs text-text-muted">عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده.</p>
          {(query || filter !== "all") && <button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-4 text-sm font-medium text-primary hover:underline">پاک کردن فیلترها</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((order, index) => <OrderCard key={order.id} order={order} index={index} />)}
        </div>
      )}
    </div>
  );
}
