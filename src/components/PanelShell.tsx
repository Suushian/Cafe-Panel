"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import { MobileMenuProvider, useMobileMenu } from "./MobileMenuContext";

const STORAGE_KEY = "cafe-sidebar-collapsed";

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { open: mobileOpen, close: closeMobile } = useMobileMenu();

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "1") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Allow keyboard users to dismiss the mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobile();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="panel-layout mx-auto flex gap-5 items-start">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>

        {/* Mobile drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-[80] ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${
              mobileOpen ? "opacity-100 duration-300" : "opacity-0 duration-200"
            } ease-out-expo`}
            onClick={closeMobile}
          />
          {/* Panel (RTL: slide from right) */}
          <div
            id="mobile-navigation-dialog"
            role={mobileOpen ? "dialog" : undefined}
            aria-modal={mobileOpen ? true : undefined}
            aria-label="منوی اصلی"
            className={`absolute inset-y-0 right-0 p-4 transition-transform ${
              mobileOpen ? "translate-x-0 duration-300" : "translate-x-full duration-200"
            } ease-out-expo`}
          >
            <Sidebar collapsed={false} onToggle={toggleCollapsed} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function PanelShell({ children }: { children: ReactNode }) {
  return (
    <MobileMenuProvider>
      <Shell>{children}</Shell>
    </MobileMenuProvider>
  );
}