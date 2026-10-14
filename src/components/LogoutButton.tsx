"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import Modal from "@/components/Modal";
import { logoutAdmin } from "@/lib/logout-action";

type Props = {
  collapsed?: boolean;
};

export default function LogoutButton({ collapsed = false }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await logoutAdmin();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`nav-link text-text-muted ${collapsed ? "justify-center gap-0" : "w-full"}`}
        title={collapsed ? "خروج" : undefined}
      >
        <span className="nav-icon">
          <LogOut size={14} strokeWidth={2} />
        </span>
        {!collapsed && <span className="flex-1 text-right">خروج</span>}
      </button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        maxWidth="sm"
        closeOnBackdrop={!pending}
        closeOnEscape={!pending}
      >
        <h2 className="text-lg font-bold text-text mb-3">خروج از حساب</h2>
        <p className="text-sm text-text-muted mb-4">
          آیا می‌خواهی از پنل خارج شوی؟ برای بازگشت باید دوباره رمز وارد کنی.
        </p>

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
            {pending ? "..." : "خروج"}
          </button>
        </div>
      </Modal>
    </>
  );
}