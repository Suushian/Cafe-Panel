"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import MenuItemCard from "./MenuItemCard";
import EmptyState from "@/components/EmptyState";
import CoffeeCup from "@/components/illustrations/CoffeeCup";
import HighlightedText from "@/components/HighlightedText";
import { useToast } from "@/components/ToastProvider";
import { deleteMenuItem } from "../actions";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

const UNDO_DURATION_MS = 5000;

export default function MenuPageClient({ items }: { items: MenuItem[] }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    () => new Set()
  );
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Escape clears search when focused
  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && query) {
      e.preventDefault();
      setQuery("");
    }
  }

  const visibleItems = useMemo(
    () => items.filter((i) => !pendingDeleteIds.has(i.id)),
    [items, pendingDeleteIds]
  );

  const filtered = useMemo(() => {
    if (!q) return visibleItems;
    return visibleItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [visibleItems, q]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, MenuItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const categories = Object.keys(grouped);
  let flatIndex = 0;

  function removeFromPending(id: string) {
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleDeleteRequest(item: MenuItem) {
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    const toastId = toast.push(`«${item.name}» حذف شد.`, "info", {
      duration: UNDO_DURATION_MS,
      action: {
        label: "بازگرداندن",
        onClick: () => {
          const timer = timersRef.current.get(item.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(item.id);
          }
          removeFromPending(item.id);
        },
      },
    });

    const timer = setTimeout(async () => {
      timersRef.current.delete(item.id);
      const result = await deleteMenuItem(item.id);
      if (result.success) {
        removeFromPending(item.id);
      } else {
        removeFromPending(item.id);
        toast.dismiss(toastId);
        toast.push(result.error, "error");
      }
    }, UNDO_DURATION_MS);

    timersRef.current.set(item.id, timer);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        illustration={<CoffeeCup size={180} />}
        title="هنوز آیتمی در منو نیست"
        description="با دکمه‌ی «افزودن آیتم» در بالای صفحه، اولین آیتم منو را اضافه کن."
      />
    );
  }

  return (
    <>
      {/* Search */}
      <div className="card mb-6 flex items-center gap-3 animate-fade-up group focus-within:border-primary/40 transition-colors">
        <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-primary/10 text-primary shrink-0 transition-transform group-focus-within:scale-105">
          <Search size={15} strokeWidth={2.4} />
        </span>
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="جستجو در نام یا دسته‌بندی... (برای فوکوس: /)"
          className="flex-1 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-soft"
          aria-label="جستجو در منو"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-text-muted hover:text-danger transition-colors shrink-0 animate-scale-in"
            aria-label="پاک کردن جستجو"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {q && (
        <p className="text-xs text-text-muted mb-4 -mt-3 animate-fade-in">
          {filtered.length > 0
            ? `${filtered.length.toLocaleString("fa-IR")} نتیجه`
            : "نتیجه‌ای پیدا نشد"}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="card animate-fade-up">
          <p className="text-text-muted text-center py-8">
            {q
              ? `هیچ آیتمی با «${query}» پیدا نشد.`
              : "همه‌ی آیتم‌ها در حال حذف هستند."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {categories.map((category, catIdx) => (
            <section
              key={category}
              className="animate-fade-up"
              style={{ animationDelay: `${catIdx * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-3 text-text-muted">
                <span className="category-mark" aria-hidden="true" />
                <h2 className="text-sm font-medium tracking-wide">
                  <HighlightedText text={category} query={query} />
                </h2>
                <span className="text-xs text-text-soft">
                  ({grouped[category].length.toLocaleString("fa-IR")})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[category].map((item) => {
                  const i = flatIndex++;
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={i}
                      query={query}
                      onDeleteRequest={handleDeleteRequest}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}