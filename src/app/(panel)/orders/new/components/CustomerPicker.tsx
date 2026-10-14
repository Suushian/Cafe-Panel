"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Search, User, X, ChevronDown, Check } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
  phone: string | null;
};

type Props = {
  customers: Customer[];
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
};

export default function CustomerPicker({ customers, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mount/unmount lifecycle with animations
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subscriptionCode.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, q]);

  function select(c: Customer) {
    onChange(c);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    onChange(null);
  }

  // Selected state
  if (value) {
    return (
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className="text-xs text-text-muted">مشتری</span>
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-card-sm px-3 py-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary shrink-0">
            <User size={13} strokeWidth={2.4} />
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm text-text truncate">{value.name}</span>
            <span className="text-xs font-mono text-text-muted">
              {value.subscriptionCode}
            </span>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-text-muted hover:text-danger transition-colors shrink-0"
            aria-label="حذف مشتری"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Not selected: show button
  return (
    <div ref={containerRef} className="flex flex-col gap-2 border-t border-border pt-3 relative">
      <span className="text-xs text-text-muted">مشتری (اختیاری)</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-right text-sm border border-dashed border-border-strong rounded-card-sm px-3 py-2 text-text-muted hover:border-primary hover:text-primary transition-all duration-250 inline-flex items-center justify-between gap-2"
      >
        <span className="inline-flex items-center gap-2">
          <User size={14} strokeWidth={2} />
          <span>انتخاب مشتری</span>
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`}
        />
      </button>

      {mounted && (
        <div
          className={`absolute bottom-full mb-2 inset-x-0 card p-0 overflow-hidden z-30 origin-bottom transition-all ${
            visible
              ? "opacity-100 translate-y-0 scale-100 duration-300"
              : "opacity-0 translate-y-2 scale-95 duration-180"
          } ease-out-expo`}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg2">
            <Search size={13} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-text placeholder:text-text-soft"
              dir="auto"
            />
          </div>

          {/* List */}
          <div className="max-h-[220px] overflow-y-auto">
            {customers.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">
                هیچ مشتری‌ای ثبت نشده. ابتدا از صفحه‌ی مشتریان اضافه کن.
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">
                نتیجه‌ای پیدا نشد.
              </p>
            ) : (
              <ul className="flex flex-col">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c)}
                      className="w-full text-right px-3 py-2 hover:bg-bg2 transition-colors flex items-center gap-3 group"
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
                        <User size={13} strokeWidth={2.2} />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm text-text truncate">{c.name}</span>
                        <span className="text-xs font-mono text-text-muted">
                          {c.subscriptionCode}
                        </span>
                      </div>
                      <Check
                        size={14}
                        className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}