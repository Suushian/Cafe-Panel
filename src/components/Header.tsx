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
    <header className="relative mb-6 flex min-h-[92px] items-center justify-between gap-3 overflow-hidden rounded-3xl border border-border bg-surface px-4 py-4 shadow-card sm:min-h-[104px] sm:gap-5 sm:px-6 sm:py-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary via-accent-warm to-transparent"
      />

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          id="mobile-menu-toggle"
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg text-primary transition-colors hover:bg-bg-2 focus-visible:outline-none lg:hidden"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          aria-controls="mobile-navigation-dialog"
        >
          <Menu size={19} strokeWidth={2} />
        </button>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm sm:h-12 sm:w-12">
          <Coffee size={22} strokeWidth={1.9} />
        </span>

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-primary-soft sm:inline">
              CAFE PANEL
            </span>
            <span className="hidden h-px w-5 bg-border-strong sm:inline-block" />
            <span className="hidden text-[11px] text-text-muted md:inline">
              مدیریت کافه
            </span>
          </div>
          <h1 className="truncate text-base font-bold leading-snug tracking-tight text-text sm:text-xl lg:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      {action && (
        <div className="relative z-10 flex shrink-0 items-center animate-fade-in" style={{ animationDelay: "120ms" }}>
          {action}
        </div>
      )}
    </header>
  );
}
