import Link from "next/link";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import {
  ArrowLeft,
  LogIn,
  UtensilsCrossed,
  ReceiptText,
  Users,
  BarChart3,
} from "lucide-react";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cafe Panel — خوش آمدید",
};

const FEATURES = [
  {
    icon: UtensilsCrossed,
    label: "منوی همیشه در دسترس",
  },
  {
    icon: ReceiptText,
    label: "ثبت سفارش بدون کاغذ",
  },
  {
    icon: Users,
    label: "مشتریان وفادار با کد اشتراک",
  },
  {
    icon: BarChart3,
    label: "گزارش زنده‌ی فروش روز",
  },
] as const;

export default async function WelcomePage() {
  const sessionOk = await verifySession();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,149,107,0.35) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-[560px] h-[560px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(111,78,55,0.4) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ============ Left: Text ============ */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-right">
            {/* Small eyebrow */}
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-primary/10 text-primary text-xs font-medium mb-6 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span>پنل مدیریت کافه</span>
            </span>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.1] animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Cafe Panel
            </h1>

            {/* Subtitle */}
            <p
              className="mt-3 text-xl lg:text-2xl font-medium text-primary/80 animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              دفترچه‌ی دیجیتال کافه‌ی شما
            </p>

            {/* Description */}
            <p
              className="mt-5 text-base text-text-muted leading-8 max-w-lg animate-fade-up"
              style={{ animationDelay: "260ms" }}
            >
              مدیریت منو، ثبت سفارش، پیگیری مشتری و گزارش فروش — همه در یک
              پنل ساده، سریع و آفلاین که همین‌جا روی کامپیوتر کافه کار می‌کند.
            </p>

            {/* Features */}
            <ul
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg animate-fade-up"
              style={{ animationDelay: "340ms" }}
            >
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <li
                    key={f.label}
                    className="flex items-center gap-2.5 text-sm text-text"
                    style={{
                      animation: "fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
                      animationDelay: `${400 + i * 60}ms`,
                    }}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{f.label}</span>
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <div
              className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: "700ms" }}
            >
              {sessionOk ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2.5 btn-primary text-base px-7 py-3.5"
                >
                  <span>ورود به پنل</span>
                  <ArrowLeft
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2.5 btn-primary text-base px-7 py-3.5"
                >
                  <LogIn size={18} />
                  <span>ورود به پنل</span>
                </Link>
              )}
            </div>

            {/* Version */}
            <div
              className="mt-10 inline-flex items-center gap-2 text-xs text-text-soft animate-fade-up"
              style={{ animationDelay: "850ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
              <span>نسخه ۱</span>
            </div>
          </div>

          {/* ============ Right: Illustration ============ */}
          <div
            className="order-1 lg:order-2 flex items-center justify-center animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            <HeroIllustration size={520} />
          </div>
        </div>
      </div>
    </main>
  );
}