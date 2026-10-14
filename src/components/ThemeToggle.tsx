"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "cafe-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
}

type Props = {
  collapsed?: boolean;
};

export default function ThemeToggle({ collapsed = false }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: Theme = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const label =
    mounted && theme === "dark" ? "حالت روشن" : "حالت تیره";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`nav-link text-text-muted ${collapsed ? "justify-center gap-0" : "w-full"}`}
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon">
        {mounted && theme === "dark" ? (
          <Sun size={14} strokeWidth={2} />
        ) : (
          <Moon size={14} strokeWidth={2} />
        )}
      </span>
      {!collapsed && <span className="flex-1 text-right">{label}</span>}
    </button>
  );
}