"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { createMenuItem, updateMenuItem } from "../actions";
import Modal from "@/components/Modal";
import RippleButton from "@/components/RippleButton";
import { useToast } from "@/components/ToastProvider";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

type Props =
  | { mode: "add"; item?: never }
  | { mode: "edit"; item: MenuItem };

export default function MenuItemFormDialog(props: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdd = props.mode === "add";
  const item = isAdd ? undefined : props.item;

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = isAdd
      ? await createMenuItem(formData)
      : await updateMenuItem(formData);

    setPending(false);

    if (result.success) {
      setOpen(false);
      toast.push(isAdd ? "آیتم جدید اضافه شد." : "تغییرات ذخیره شد.", "success");
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
            ? "btn-primary text-sm"
            : "text-xs text-text-muted hover:text-primary transition-colors"
        }
      >
        {isAdd ? "افزودن آیتم" : "ویرایش"}
      </button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        maxWidth="md"
        closeOnBackdrop={!pending}
        closeOnEscape={!pending}
      >
        <h2 className="text-lg font-bold text-text mb-4">
          {isAdd ? "افزودن آیتم جدید" : "ویرایش آیتم"}
        </h2>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {!isAdd && <input type="hidden" name="id" value={item!.id} />}

          <div className="field">
            <label htmlFor="name" className="field-label">نام</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={item?.name ?? ""}
              required
              maxLength={60}
              autoFocus
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor="price" className="field-label">قیمت (تومان)</label>
            <input
              id="price"
              name="price"
              type="number"
              defaultValue={item?.price ?? ""}
              required
              min={1}
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor="category" className="field-label">دسته‌بندی</label>
            <select
              id="category"
              name="category"
              defaultValue={item?.category ?? CATEGORIES[0]}
              className="field-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={item?.isAvailable ?? true}
              className="accent-primary w-4 h-4"
            />
            <span>موجود است</span>
          </label>

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