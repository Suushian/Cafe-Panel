"use client";

import { Menu, Sparkle } from "lucide-react";
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
    <header className="card mb-6 flex items-center justify-between gap-3 animate-fade-down">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only on mobile/tablet */}
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-card-sm bg-primary/10 text-primary hover:bg-primary/15 transition-colors shrink-0"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          aria-controls="mobile-navigation-dialog"
        >
          <Menu size={17} strokeWidth={2.2} />
        </button>

        <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-card-sm bg-primary/10 text-primary animate-fade-in shrink-0">
          <Sparkle size={15} strokeWidth={2.2} />
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight truncate">
          {title}
        </h1>
      </div>
      {action && (
        <div className="animate-fade-in shrink-0" style={{ animationDelay: "150ms" }}>
          {action}
        </div>
      )}
    </header>
  );
}