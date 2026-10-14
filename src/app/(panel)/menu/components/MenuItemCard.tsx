"use client";

import { useRef } from "react";
import { formatPrice } from "@/lib/format";
import MenuItemFormDialog from "./MenuItemFormDialog";
import DeleteMenuItemButton from "./DeleteMenuItemButton";
import { useTilt } from "@/lib/use-tilt";
import HighlightedText from "@/components/HighlightedText";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

type Props = {
  item: MenuItem;
  index?: number;
  query?: string;
  onDeleteRequest?: (item: MenuItem) => void;
};

export default function MenuItemCard({
  item,
  index = 0,
  query = "",
  onDeleteRequest,
}: Props) {
  const { ref, onMove, onLeave } = useTilt<HTMLDivElement>({
    max: 5,
    scale: 1.02,
    perspective: 900,
  });
  const shineRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    onMove(e);
    const el = shineRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      el.style.setProperty("--mx", `${mx}px`);
      el.style.setProperty("--my", `${my}px`);
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
      className="tilt-card card card-hover stagger-item group relative overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
    >
      <div ref={shineRef} className="tilt-card-shine" aria-hidden="true" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text group-hover:text-primary transition-colors duration-300">
            <HighlightedText text={item.name} query={query} />
          </h3>
          {item.isAvailable ? (
            <span className="chip bg-primary/10 text-primary shrink-0">
              موجود
            </span>
          ) : (
            <span className="chip bg-border text-text-muted shrink-0">
              ناموجود
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted tabular-nums">
            {formatPrice(item.price)}
          </p>
          <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <MenuItemFormDialog mode="edit" item={item} />
            {onDeleteRequest && (
              <DeleteMenuItemButton onClick={() => onDeleteRequest(item)} />
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute -top-8 -left-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,149,107,0.22) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}