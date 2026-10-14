"use client";

import Link from "next/link";
import {
  Plus,
  UtensilsCrossed,
  Users,
  BarChart3,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Action = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  highlight?: boolean;
};

const ACTIONS: Action[] = [
  {
    href: "/orders/new",
    label: "سفارش جدید",
    icon: Plus,
    shortcut: "N",
    highlight: true,
  },
  {
    href: "/menu",
    label: "منو",
    icon: UtensilsCrossed,
    shortcut: "G M",
  },
  {
    href: "/customers",
    label: "مشتریان",
    icon: Users,
    shortcut: "G C",
  },
  {
    href: "/reports",
    label: "گزارش‌ها",
    icon: BarChart3,
    shortcut: "G R",
  },
];

export default function QuickActions() {
  return (
    <section className="card animate-fade-up">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary">
          <Zap size={16} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-text">
            میانبرهای سریع
          </h3>
          <span className="text-xs text-text-muted">
            با یک کلیک به هر بخش
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border transition-all duration-250 stagger-item ${
                action.highlight
                  ? "bg-primary/8 border-primary/25 text-primary hover:bg-primary/12 hover:-translate-y-0.5"
                  : "bg-bg2/50 border-border text-text-muted hover:border-border-strong hover:bg-bg2 hover:-translate-y-0.5"
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 transition-transform duration-400 ease-out-back group-hover:scale-110 ${
                  action.highlight
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-text"
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>

              <span className="text-xs font-semibold text-center">
                {action.label}
              </span>

              <kbd
                className={`text-2xs font-mono px-1.5 py-0.5 rounded border transition-opacity ${
                  action.highlight
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-surface text-text-soft"
                }`}
              >
                {action.shortcut}
              </kbd>
            </Link>
          );
        })}
      </div>
    </section>
  );
}