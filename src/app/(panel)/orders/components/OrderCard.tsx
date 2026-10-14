import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/format";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type OrderStatus,
} from "@/lib/order-status";
import {
  ORDER_TYPE_LABELS,
  isOrderType,
} from "@/lib/order-type";
import OrderTypeIcon from "@/components/OrderTypeIcon";
import OrderStatusActions from "./OrderStatusActions";
import AnimatedPrice from "./AnimatedPrice";
import { RotateCcw, User, Pencil } from "lucide-react";

type Props = {
  order: {
    id: string;
    status: string;
    orderType: string;
    totalPrice: number;
    discountAmount: number;
    createdAt: Date;
    customer: {
      name: string;
      subscriptionCode: string;
    } | null;
    items: {
      id: string;
      quantity: number;
      unitPrice: number;
      menuItem: { name: string };
    }[];
  };
  index?: number;
};

export default function OrderCard({ order, index = 0 }: Props) {
  const status = order.status as OrderStatus;
  const label = STATUS_LABELS[status] ?? order.status;
  const style = STATUS_STYLES[status] ?? "bg-border text-text-muted";

  const orderType = isOrderType(order.orderType) ? order.orderType : null;
  const hasDiscount = order.discountAmount > 0;
  const finalPrice = Math.max(0, order.totalPrice - order.discountAmount);

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const isOpen = status === "open";

  return (
    <article
      className="order-card card stagger-item flex flex-col gap-3"
      style={{ animationDelay: `${Math.min(index * 70, 700)}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-text-muted tabular-nums">
            {formatDateTime(order.createdAt)}
          </span>
          {orderType && (
            <span className="text-xs text-text-muted inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-bg2">
              <OrderTypeIcon type={orderType} size={13} />
              <span>{ORDER_TYPE_LABELS[orderType]}</span>
            </span>
          )}
        </div>
        <span className={`status-chip ${style}`}>
          {isOpen && <span className="status-dot" aria-hidden="true" />}
          {label}
        </span>
      </div>

      {order.customer && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-card-sm px-2.5 py-1.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary shrink-0">
            <User size={11} strokeWidth={2.4} />
          </span>
          <span className="text-xs text-text truncate">{order.customer.name}</span>
          <span className="text-xs font-mono text-text-muted shrink-0">
            {order.customer.subscriptionCode}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-text">
          {itemCount.toLocaleString("fa-IR")} آیتم
        </span>
        <span className="font-bold text-text text-lg">
          <AnimatedPrice value={finalPrice} />
        </span>
      </div>

      {hasDiscount && (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span>مجموع</span>
            <span className="tabular-nums line-through">
              {formatPrice(order.totalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-success">
            <span>تخفیف</span>
            <span className="tabular-nums">
              − {formatPrice(order.discountAmount)}
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.menuItem.name} × {item.quantity.toLocaleString("fa-IR")}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-3 flex-wrap">
        {isOpen && (
          <Link
            href={`/orders/${order.id}/edit`}
            className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all duration-250"
          >
            <Pencil size={13} strokeWidth={2.4} />
            <span>ویرایش</span>
          </Link>
        )}
        <Link
          href={`/orders/new?from=${order.id}`}
          className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-border text-text-muted hover:border-primary hover:text-primary transition-all duration-250"
        >
          <RotateCcw size={13} strokeWidth={2.4} />
          <span>تکرار سفارش</span>
        </Link>
      </div>

      {isOpen && (
        <OrderStatusActions orderId={order.id} currentStatus={order.status} />
      )}
    </article>
  );
}