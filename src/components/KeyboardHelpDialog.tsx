"use client";

import Modal from "@/components/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["N"], label: "سفارش جدید" },
  { keys: ["G", "D"], label: "رفتن به داشبورد" },
  { keys: ["G", "M"], label: "رفتن به منو" },
  { keys: ["G", "O"], label: "رفتن به سفارش‌ها" },
  { keys: ["G", "R"], label: "رفتن به گزارش‌ها" },
  { keys: ["G", "C"], label: "رفتن به مشتریان" },
  { keys: ["?"], label: "نمایش این راهنما" },
  { keys: ["Esc"], label: "بستن پنجره" },
];

export default function KeyboardHelpDialog({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <h2 className="text-lg font-bold text-text mb-4">
        کلیدهای میانبر
      </h2>
      <ul className="flex flex-col gap-2">
        {SHORTCUTS.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0"
          >
            <span className="text-sm text-text">{s.label}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="text-xs px-2 py-1 rounded-md bg-bg2 border border-border text-text font-mono min-w-[28px] text-center"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClose}
          className="btn-primary"
        >
          متوجه شدم
        </button>
      </div>
    </Modal>
  );
}