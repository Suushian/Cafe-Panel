"use client";

import { useRef } from "react";
import { Phone, ReceiptText, User } from "lucide-react";
import CustomerFormDialog from "./CustomerFormDialog";
import DeleteCustomerButton from "./DeleteCustomerButton";
import { useTilt } from "@/lib/use-tilt";
import HighlightedText from "@/components/HighlightedText";

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
  phone: string | null;
  createdAt: Date;
};

type Props = {
  customer: Customer;
  orderCount: number;
  index?: number;
  query?: string;
};

export default function CustomerCard({
  customer,
  orderCount,
  index = 0,
  query = "",
}: Props) {
  const { ref, onMove, onLeave } = useTilt<HTMLDivElement>({
    max: 4,
    scale: 1.015,
    perspective: 900,
  });
  const shineRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    onMove(e);
    const el = shineRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
      className="tilt-card card card-hover stagger-item group relative overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <div ref={shineRef} className="tilt-card-shine" aria-hidden="true" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0 transition-transform duration-400 ease-out-back group-hover:scale-105">
            <User size={18} strokeWidth={2.2} />
          </span>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3 className="font-semibold text-text truncate">
              <HighlightedText text={customer.name} query={query} />
            </h3>
            <span className="text-xs font-mono text-text-muted bg-bg2 px-2 py-0.5 rounded-md w-fit">
              <HighlightedText text={customer.subscriptionCode} query={query} />
            </span>
          </div>
          {orderCount > 0 && (
            <span className="chip bg-primary/10 text-primary shrink-0">
              <ReceiptText size={11} />
              {orderCount.toLocaleString("fa-IR")}
            </span>
          )}
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Phone size={12} />
            <span className="font-mono" dir="ltr">
              <HighlightedText text={customer.phone} query={query} />
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          <CustomerFormDialog mode="edit" customer={customer} />
          <DeleteCustomerButton
            id={customer.id}
            name={customer.name}
            orderCount={orderCount}
          />
        </div>
      </div>
    </div>
  );
}