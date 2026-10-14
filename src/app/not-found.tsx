import Link from "next/link";
import { Home } from "lucide-react";
import BrokenCup from "@/components/illustrations/BrokenCup";

export const metadata = {
  title: "صفحه پیدا نشد — Cafe Panel",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center relative overflow-hidden animate-fade-up">
        {/* Decorative orbs */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(200,149,107,0.22) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(111,78,55,0.16) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center">
          {/* Broken cup */}
          <div className="text-primary mb-4">
            <BrokenCup size={180} />
          </div>

          {/* 404 text */}
          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">
            ۴۰۴
          </h1>

          <h2 className="text-base font-semibold text-text mb-2">
            این صفحه پیدا نشد
          </h2>

          <p className="text-sm text-text-muted leading-6 mb-6 max-w-xs">
            فنجون‌مون شکست! به نظر می‌رسد مسیری که دنبالش هستی وجود ندارد.
          </p>

          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home size={16} strokeWidth={2.4} />
            <span>بازگشت به داشبورد</span>
          </Link>
        </div>
      </div>
    </main>
  );
}