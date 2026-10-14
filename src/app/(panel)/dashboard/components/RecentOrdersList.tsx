"use client";

import Link from "next/link";
import { ReceiptText, ArrowLeft, User } from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type OrderStatus,
} from "@/lib/order-status";
import { ORDER_TYPE_LABELS, isOrderType, type OrderType } from "@/lib/order-type";
import OrderTypeIcon from "@/components/OrderTypeIcon";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  orderType: string;
  totalPrice: number;
  discountAmount: number;
  createdAt: Date;
  customer: { name: string } | null;
  itemCount: number;
};

type Props = {
  orders: Order[];
};

export default function RecentOrdersList({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary">
              <ReceiptText size={16} strokeWidth={2.2} />
            </span>
            <h3 className="text-sm font-semibold text-text">
              آخرین سفارش‌ها
            </h3>
          </div>
        </div>
        <p className="text-xs text-text-muted text-center py-8">
          هنوز سفارشی ثبت نشده است.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary">
            <ReceiptText size={16} strokeWidth={2.2} />
          </span>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-text">
              آخرین سفارش‌ها
            </h3>
            <span className="text-xs text-text-muted">
              {orders.length.toLocaleString("fa-IR")} سفارش اخیر
            </span>
          </div>
        </div>
        <Link
          href="/orders"
          className="text-xs inline-flex items-center gap-1 text-text-muted hover:text-primary transition-colors group"
        >
          <span>مشاهده‌ی همه</span>
          <ArrowLeft
            size={13}
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
        </Link>
      </div>

      {/* List */}
      <ul className="flex flex-col divide-y divide-border">
        {orders.map((order, idx) => {
          const status = order.status as OrderStatus;
          const label = STATUS_LABELS[status] ?? order.status;
          const style = STATUS_STYLES[status] ?? "bg-border text-text-muted";
          const finalPrice = Math.max(
            0,
            order.totalPrice - order.discountAmount
          );
          const orderType = isOrderType(order.orderType) ? order.orderType : null;

          const time = new Intl.DateTimeFormat("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(order.createdAt);

          return (
            <li
              key={order.id}
              className="report-row"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Link
                href="/orders"
                className="flex items-center gap-3 py-3 px-1 -mx-1 rounded-xl hover:bg-bg2 transition-colors group"
              >
                {/* Time */}
                <div className="flex flex-col items-center shrink-0 w-12">
                  <span className="text-xs font-semibold text-text tabular-nums">
                    {time}
                  </span>
                  {orderType && (
                    <span className="text-text-soft mt-0.5">
                      <OrderTypeIcon type={orderType} size={11} />
                    </span>
                  )}
                </div>

                {/* Customer / "بدون مشتری" */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {order.customer ? (
                    <>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
                        <User size={12} strokeWidth={2.4} />
                      </span>
                      <span className="text-sm text-text truncate">
                        {order.customer.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-bg2 text-text-soft shrink-0">
                        <User size={12} strokeWidth={2.2} />
                      </span>
                      <span className="text-sm text-text-soft">
                        بدون مشتری
                      </span>
                    </>
                  )}
                </div>

                {/* Item count */}
                <span className="text-xs text-text-muted tabular-nums shrink-0 hidden sm:block">
                  {order.itemCount.toLocaleString("fa-IR")} آیتم
                </span>

                {/* Price */}
                <span className="text-sm font-bold text-text tabular-nums shrink-0">
                  {formatPrice(finalPrice)}
                </span>

                {/* Status */}
                <span
                  className={`status-chip ${style} shrink-0 hidden md:inline-flex`}
                >
                  {status === "open" && (
                    <span className="status-dot" aria-hidden="true" />
                  )}
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}