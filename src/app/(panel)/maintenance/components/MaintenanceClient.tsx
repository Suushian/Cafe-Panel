"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Users,
  UtensilsCrossed,
  LogOut,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { resetDatabase, type ResetFilters } from "../actions";
import { useToast } from "@/components/ToastProvider";

const CONFIRM_WORD = "DELETE";

const OPTIONS: {
  key: keyof ResetFilters;
  label: string;
  description: string;
  icon: typeof Database;
}[] = [
  {
    key: "orders",
    label: "همه‌ی سفارش‌ها",
    description: "شامل آیتم‌های سفارش‌ها (cascade)",
    icon: Database,
  },
  {
    key: "customers",
    label: "همه‌ی مشتریان",
    description: "سفارش‌ها حفظ می‌شوند، فقط مشتری از آن‌ها حذف می‌شود",
    icon: Users,
  },
  {
    key: "menuItems",
    label: "آیتم‌های منو",
    description: "آیتم‌های استفاده‌شده در سفارش‌ها حفظ می‌شوند",
    icon: UtensilsCrossed,
  },
  {
    key: "sessions",
    label: "همه‌ی نشست‌ها",
    description: "باعث خروج شما از پنل می‌شود",
    icon: LogOut,
  },
];

type ResultData = {
  backupFilename: string;
  deleted: {
    orders: number;
    customers: number;
    menuItems: number;
    sessions: number;
  };
};

export default function MaintenanceClient() {
  const toast = useToast();
  const [filters, setFilters] = useState<ResetFilters>({
    orders: false,
    customers: false,
    menuItems: false,
    sessions: false,
  });
  const [confirmWord, setConfirmWord] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  const anySelected =
    filters.orders ||
    filters.customers ||
    filters.menuItems ||
    filters.sessions;
  const confirmOk = confirmWord.trim() === CONFIRM_WORD;
  const canSubmit = anySelected && confirmOk && !pending;

  function toggle(key: keyof ResetFilters) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setPending(true);
    setError(null);
    setResult(null);

    const r = await resetDatabase(filters, confirmWord);

    setPending(false);

    if (r.success) {
      setResult({
        backupFilename: r.backupFilename,
        deleted: r.deleted,
      });
      toast.push("عملیات با موفقیت اجرا شد.", "success");
      setConfirmWord("");
      setFilters({
        orders: false,
        customers: false,
        menuItems: false,
        sessions: false,
      });
    } else {
      setError(r.error);
      toast.push(r.error, "error");
    }
  }

  return (
    <>
      {/* Warning banner */}
      <div className="card mb-6 border-danger/30 bg-danger-soft/40 flex items-start gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-card-sm bg-danger/15 text-danger shrink-0">
          <ShieldAlert size={18} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-danger">
            ناحیه‌ی خطرناک
          </span>
          <span className="text-xs text-text-muted leading-6">
            عملیات این صفحه قابل بازگشت نیستند. قبل از اجرا، یک نسخه‌ی پشتیبان
            به‌طور خودکار در پوشه‌ی <code className="font-mono">data/backups/</code> ساخته می‌شود.
          </span>
        </div>
      </div>

      {/* Selection */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-text-muted mb-3">
          چه چیزی پاک شود؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = filters[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggle(opt.key)}
                className={`card text-right transition-all duration-250 flex items-start gap-3 ${
                  active
                    ? "border-danger/50 bg-danger-soft/30"
                    : "hover:border-border-strong"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-card-sm shrink-0 ${
                    active
                      ? "bg-danger/15 text-danger"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-text">
                    {opt.label}
                  </span>
                  <span className="text-xs text-text-muted leading-5">
                    {opt.description}
                  </span>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    active
                      ? "bg-danger border-danger text-white"
                      : "border-border-strong"
                  }`}
                >
                  {active && <CheckCircle2 size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Confirm */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-text-muted mb-3">
          تأیید نهایی
        </h2>
        <div className="card flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={15}
              className="text-danger shrink-0 mt-0.5"
            />
            <p className="text-xs text-text-muted leading-6">
              برای تأیید، کلمه‌ی زیر را دقیقاً تایپ کن:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-bg2 border border-border rounded-md px-2 py-1 select-all">
              {CONFIRM_WORD}
            </code>
            <span className="text-xs text-text-soft">(بدون فاصله)</span>
          </div>
          <input
            type="text"
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            dir="ltr"
            className="field-input font-mono text-left"
            placeholder="تایپ کن..."
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 text-sm alert-error">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mb-6 card border-success/30 bg-success-soft/40">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-card-sm bg-success/15 text-success shrink-0">
              <CheckCircle2 size={18} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-sm font-semibold text-success">
                عملیات با موفقیت انجام شد
              </span>
              <div className="text-xs text-text-muted flex flex-col gap-1">
                <span>
                  نسخه‌ی پشتیبان:{" "}
                  <code className="font-mono text-text">
                    {result.backupFilename}
                  </code>
                </span>
                <span className="border-t border-border pt-1 mt-1">
                  حذف‌شده‌ها:
                </span>
                <ul className="flex flex-col gap-1">
                  {result.deleted.orders > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                      <span>
                        سفارش‌ها: {result.deleted.orders.toLocaleString("fa-IR")}
                      </span>
                    </li>
                  )}
                  {result.deleted.customers > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                      <span>
                        مشتریان: {result.deleted.customers.toLocaleString("fa-IR")}
                      </span>
                    </li>
                  )}
                  {result.deleted.menuItems > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                      <span>
                        آیتم‌های منو: {result.deleted.menuItems.toLocaleString("fa-IR")}
                      </span>
                    </li>
                  )}
                  {result.deleted.sessions > 0 && (
                    <li className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                      <span>
                        نشست‌ها: {result.deleted.sessions.toLocaleString("fa-IR")}
                      </span>
                    </li>
                  )}
                  {!result.deleted.orders &&
                    !result.deleted.customers &&
                    !result.deleted.menuItems &&
                    !result.deleted.sessions && (
                      <li className="inline-flex items-center gap-2 text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-soft shrink-0" aria-hidden="true" />
                        <span>هیچ موردی حذف نشد.</span>
                      </li>
                    )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-card font-medium inline-flex items-center justify-center gap-2 transition-all duration-250 ${
          canSubmit
            ? "bg-danger text-white hover:brightness-110"
            : "bg-border text-text-soft cursor-not-allowed"
        }`}
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        <span>{pending ? "در حال اجرا..." : "اجرای عملیات"}</span>
      </button>

      {!anySelected && (
        <p className="text-xs text-text-soft text-center mt-3">
          حداقل یک بخش را انتخاب کن.
        </p>
      )}
      {anySelected && !confirmOk && (
        <p className="text-xs text-text-soft text-center mt-3">
          کلمه‌ی تأیید را تایپ کن.
        </p>
      )}
    </>
  );
}