"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { updateOrderStatus } from "../actions";
import { STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";

type Props = {
  orderId: string;
  currentStatus: string;
};

export default function OrderStatusActions({ orderId, currentStatus }: Props) {
  const toast = useToast();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== "open") return null;

  async function handleConfirm() {
    if (!confirmTarget) return;
    setPending(confirmTarget);
    setError(null);
    const result = await updateOrderStatus(orderId, confirmTarget);
    setPending(null);
    if (result.success) {
      const t = confirmTarget;
      setConfirmTarget(null);
      toast.push(
        t === "paid" ? "سفارش به‌عنوان پرداخت‌شده ثبت شد." : "سفارش لغو شد.",
        t === "paid" ? "success" : "info"
      );
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <div className="flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => { setError(null); setConfirmTarget("paid"); }}
          disabled={pending !== null}
          className="text-xs px-3 py-1.5 rounded-pill inline-flex items-center gap-1.5 bg-success text-white hover:brightness-105 transition-all duration-250 disabled:opacity-50"
        >
          <Check size={14} strokeWidth={2.6} />
          <span>پرداخت شد</span>
        </button>
        <button
          type="button"
          onClick={() => { setError(null); setConfirmTarget("cancelled"); }}
          disabled={pending !== null}
          className="text-xs px-3 py-1.5 rounded-pill inline-flex items-center gap-1.5 text-text-muted border border-border hover:bg-bg transition-all duration-250 disabled:opacity-50"
        >
          <X size={14} strokeWidth={2.4} />
          <span>لغو سفارش</span>
        </button>
      </div>

      <Modal
        open={confirmTarget !== null}
        onClose={() => !pending && setConfirmTarget(null)}
        maxWidth="sm"
        closeOnBackdrop={!pending}
        closeOnEscape={!pending}
      >
        <h2 className="text-lg font-bold text-text mb-3">تغییر وضعیت</h2>
        <p className="text-sm text-text-muted mb-4">
          آیا وضعیت این سفارش به «{confirmTarget ? STATUS_LABELS[confirmTarget] : ""}» تغییر کند؟ این عمل قابل بازگشت نیست.
        </p>

        {error && (
          <p className="text-sm alert-error mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setConfirmTarget(null)}
            disabled={pending !== null}
            className="px-4 py-2 rounded-xl text-sm text-text hover:bg-bg transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending !== null}
            className={`btn-primary ${pending ? "btn-loading" : ""}`}
          >
            تأیید
          </button>
        </div>
      </Modal>
    </>
  );
}