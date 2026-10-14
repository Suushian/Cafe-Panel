"use client";

import { useState } from "react";
import { createCustomer, updateCustomer } from "../actions";
import Modal from "@/components/Modal";
import RippleButton from "@/components/RippleButton";
import { useToast } from "@/components/ToastProvider";
import { UserPlus, UserCog } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
  phone: string | null;
};

type Props =
  | { mode: "add"; customer?: never }
  | { mode: "edit"; customer: Customer };

export default function CustomerFormDialog(props: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdd = props.mode === "add";
  const customer = isAdd ? undefined : props.customer;

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = isAdd
      ? await createCustomer(formData)
      : await updateCustomer(formData);

    setPending(false);

    if (result.success) {
      setOpen(false);
      toast.push(
        isAdd ? "مشتری جدید اضافه شد." : "تغییرات ذخیره شد.",
        "success"
      );
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={
          isAdd
            ? "btn-primary text-sm inline-flex items-center gap-1.5"
            : "text-xs text-text-muted hover:text-primary transition-colors"
        }
      >
        {isAdd ? (
          <>
            <UserPlus size={15} strokeWidth={2.4} />
            <span>افزودن مشتری</span>
          </>
        ) : (
          "ویرایش"
        )}
      </button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        maxWidth="md"
        closeOnBackdrop={!pending}
        closeOnEscape={!pending}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-card-sm bg-primary/10 text-primary">
            <UserCog size={17} strokeWidth={2.2} />
          </span>
          <h2 className="text-lg font-bold text-text">
            {isAdd ? "افزودن مشتری جدید" : "ویرایش مشتری"}
          </h2>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {!isAdd && <input type="hidden" name="id" value={customer!.id} />}

          <div className="field">
            <label htmlFor="name" className="field-label">
              نام مشتری
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={customer?.name ?? ""}
              required
              maxLength={60}
              autoFocus
              className="field-input"
              placeholder="مثلاً احمد رضایی"
            />
          </div>

          <div className="field">
            <label htmlFor="subscriptionCode" className="field-label">
              کد اشتراک
            </label>
            <input
              id="subscriptionCode"
              name="subscriptionCode"
              type="text"
              defaultValue={customer?.subscriptionCode ?? ""}
              required
              maxLength={30}
              dir="ltr"
              className="field-input font-mono text-left"
              placeholder="مثلاً 1001 یا VIP-05"
            />
            <p className="text-xs text-text-soft mt-1">
              فقط حروف انگلیسی، عدد، خط تیره و زیرخط.
            </p>
          </div>

          <div className="field">
            <label htmlFor="phone" className="field-label">
              شماره تلفن (اختیاری)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              defaultValue={customer?.phone ?? ""}
              dir="ltr"
              className="field-input font-mono text-left"
              placeholder="09120000000"
            />
          </div>

          {error && (
            <p className="text-sm alert-error">
              {error}
            </p>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="px-4 py-2 rounded-xl text-sm text-text hover:bg-bg transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
            <RippleButton
              type="submit"
              disabled={pending}
              className={`${pending ? "btn-loading" : ""}`}
            >
              {isAdd ? "افزودن" : "ذخیره"}
            </RippleButton>
          </div>
        </form>
      </Modal>
    </>
  );
}