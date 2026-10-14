"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

type Item = {
  name: string;
  quantity: number;
  revenue: number;
};

export default function TopItemsTable({ items }: { items: Item[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const maxQty = Math.max(...items.map((i) => i.quantity), 1);

  return (
    <div ref={ref} className="card p-0 overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((item, idx) => {
          const rank = idx + 1;
          const pct = (item.quantity / maxQty) * 100;

          return (
            <div
              key={item.name}
              className="report-row px-5 py-4 flex flex-col gap-2"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="rank-badge" data-rank={rank <= 3 ? rank : undefined}>
                  {rank.toLocaleString("fa-IR")}
                </span>
                <span className="text-sm text-text font-medium flex-1 min-w-0 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-text-muted tabular-nums shrink-0">
                  {item.quantity.toLocaleString("fa-IR")} فروش
                </span>
                <span className="text-sm text-text font-semibold tabular-nums shrink-0">
                  {formatPrice(item.revenue)}
                </span>
              </div>
              <div className="progress-track ms-9">
                <div
                  className="progress-fill"
                  data-visible={visible}
                  style={{
                    width: `${pct}%`,
                    transitionDelay: `${400 + idx * 70}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}