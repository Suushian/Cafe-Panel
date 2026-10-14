"use client";

import { useState } from "react";
import { deleteCustomer } from "../actions";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";

type Props = {
  id: string;
  name: string;
  orderCount: number;
};

export default function DeleteCustomerButton({ id, name, orderCount }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    const result = await deleteCustomer(id);
    setPending(false);
    if (result.success) {
      setOpen(false);
      toast.push("مشتری حذف شد.", "success");
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(null); setOpen(true); }}
        className="text-xs text-text-muted hover:text-red-700 transition-colors"
      >
        حذف
      </button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        maxWidth="sm"
        closeOnBackdrop={!pending}
        closeOnEscape={!pending}
      >
        <h2 className="text-lg font-bold text-text mb-3">حذف مشتری</h2>
        <p className="text-sm text-text-muted mb-4">
          آیا از حذف «{name}» مطمئنی؟ این عمل قابل بازگشت نیست.
        </p>

        {orderCount > 0 && (
          <p className="text-sm bg-primary/10 border border-primary/20 text-primary rounded-card px-3 py-2 mb-4">
            این مشتری {orderCount.toLocaleString("fa-IR")} سفارش دارد.
            سفارش‌ها حفظ می‌شوند، ولی از این پس بدون مشتری نمایش داده می‌شوند.
          </p>
        )}

        {error && (
          <p className="text-sm alert-error mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="px-4 py-2 rounded-xl text-sm text-text hover:bg-bg transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="px-4 py-2 rounded-xl text-sm bg-danger text-white hover:brightness-105 transition-all disabled:opacity-50"
          >
            {pending ? "..." : "حذف"}
          </button>
        </div>
      </Modal>
    </>
  );
}