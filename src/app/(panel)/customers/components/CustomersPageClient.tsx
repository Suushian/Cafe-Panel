"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import CustomerCard from "./CustomerCard";
import EmptyState from "@/components/EmptyState";
import PeopleIllustration from "@/components/illustrations/PeopleIllustration";
import HighlightedText from "@/components/HighlightedText";

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
  phone: string | null;
  createdAt: Date;
};

type Props = {
  customers: Customer[];
  orderCounts: Record<string, number>;
};

export default function CustomersPageClient({ customers, orderCounts }: Props) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  // "/" to focus
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

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && query) {
      e.preventDefault();
      setQuery("");
    }
  }

  const filtered = useMemo(() => {
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subscriptionCode.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, q]);

  if (customers.length === 0) {
    return (
      <EmptyState
        illustration={<PeopleIllustration size={180} />}
        title="هنوز مشتری‌ای ثبت نشده"
        description="با دکمه‌ی «افزودن مشتری» در بالای صفحه، اولین مشتری را اضافه کن."
      />
    );
  }

  return (
    <>
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
          placeholder="جستجو در نام، کد اشتراک یا تلفن... (برای فوکوس: /)"
          className="flex-1 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-soft"
          aria-label="جستجو در مشتریان"
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
            هیچ مشتری‌ای با «{query}» پیدا نشد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer, i) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              orderCount={orderCounts[customer.id] ?? 0}
              index={i}
              query={query}
            />
          ))}
        </div>
      )}
    </>
  );
}