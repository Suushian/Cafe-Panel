"use client";

import { Coffee, Menu } from "lucide-react";
import { useMobileMenu } from "./MobileMenuContext";

export default function Header({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const { toggle, open } = useMobileMenu();

  return (
    <header className="panel-page-header relative isolate mb-6 flex min-h-[112px] items-center justify-between gap-4 overflow-hidden rounded-[2rem] border border-border bg-surface px-4 py-5 shadow-card sm:min-h-[132px] sm:px-7 sm:py-6">
      {/* Coffee-brown organic shape inspired by the reference landing page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[34%] rounded-r-[48%] bg-primary"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-7 -top-10 h-28 w-28 rounded-full border border-white/10 bg-white/[0.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-[23%] h-3 w-7 rotate-[-35deg] rounded-full border border-white/20 bg-accent-warm/70"
      />

      <div className="relative z-10 flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          id="mobile-menu-toggle"
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          aria-controls="mobile-navigation-dialog"
        >
          <Menu size={18} strokeWidth={2.2} />
        </button>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-sm sm:h-12 sm:w-12">
          <Coffee size={22} strokeWidth={1.9} />
        </span>

        <div className="min-w-0">
          <p className="mb-1 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:block">
            CAFE PANEL
          </p>
          <h1 className="max-w-[min(52vw,560px)] truncate text-base font-extrabold tracking-tight text-text sm:text-xl lg:text-2xl">
            {title}
          </h1>
          <p className="mt-1 hidden text-xs text-text-muted sm:block">
            مدیریت کافه، ساده و یکپارچه
          </p>
        </div>
      </div>

      {action && (
        <div className="relative z-10 shrink-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {action}
        </div>
      )}
    </header>
  );
}
