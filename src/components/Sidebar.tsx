"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Coffee,
  LayoutDashboard,
  UtensilsCrossed,
  ReceiptText,
  BarChart3,
  Users,
  Sparkles,
  Keyboard,
  Wrench,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import KeyboardHelpDialog from "./KeyboardHelpDialog";
import ThemeToggle from "./ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard, shortcut: "G D" },
  { href: "/menu", label: "منو", icon: UtensilsCrossed, shortcut: "G M" },
  { href: "/orders", label: "سفارش‌ها", icon: ReceiptText, shortcut: "G O" },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3, shortcut: "G R" },
  { href: "/customers", label: "مشتریان", icon: Users, shortcut: "G C" },
  { href: "/maintenance", label: "نگهداری", icon: Wrench },
];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  const itemClass = (extra: string = "") =>
    `nav-link text-text-muted group/nav ${collapsed ? "justify-center gap-0" : "w-full"} ${extra}`;

  return (
    <>
      <aside
        className={`card h-fit flex flex-col gap-4 transition-all duration-300 ease-out-expo ${
          collapsed ? "w-[76px] px-3 py-5" : "w-[240px] p-6"
        }`}
      >
        {/* Brand */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 group ${
            collapsed ? "justify-center" : ""
          }`}
          aria-label="Cafe Panel"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-card bg-primary text-white shadow-card shrink-0 transition-transform duration-400 ease-out-back group-hover:scale-105 group-hover:rotate-[-4deg]">
            <Coffee size={18} strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <h2 className="text-lg font-bold text-primary tracking-tight truncate">
              Cafe Panel
            </h2>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass()}
                data-active={active ? "true" : "false"}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">
                  <Icon size={16} strokeWidth={2.1} />
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-text-soft opacity-0 group-hover/nav:opacity-100 transition-opacity">
                        {item.shortcut}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={`mt-2 pt-4 border-t border-border flex flex-col gap-1 ${
            collapsed ? "items-center" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className={itemClass()}
            title={collapsed ? "میانبرها" : undefined}
          >
            <span className="nav-icon">
              <Keyboard size={14} strokeWidth={2} />
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 text-right">میانبرها</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg2 border border-border font-mono">
                  ?
                </kbd>
              </>
            )}
          </button>

          <Link
            href="/welcome"
            className={itemClass()}
            title={collapsed ? "خوش‌آمد" : undefined}
          >
            <span className="nav-icon">
              <Sparkles size={14} strokeWidth={2} />
            </span>
            {!collapsed && <span>خوش‌آمد</span>}
          </Link>

          <ThemeToggle collapsed={collapsed} />
          <LogoutButton collapsed={collapsed} />
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={onToggle}
          className={itemClass("mt-2")}
          aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
          title={collapsed ? "باز کردن" : "جمع کردن"}
        >
          <span className="nav-icon">
            <ChevronRight
              size={14}
              strokeWidth={2}
              className={`transition-transform duration-300 ease-out-expo ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </span>
          {!collapsed && <span className="flex-1 text-right">جمع کردن</span>}
        </button>
      </aside>

      <KeyboardHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}