"use client";

import { useCallback, useRef } from "react";

type Options = {
  /** Duration of the ripple animation in ms */
  duration?: number;
  /** Color (any valid CSS color) */
  color?: string;
};

export function useRipple<T extends HTMLElement = HTMLButtonElement>({
  duration = 600,
  color = "rgba(255,255,255,0.35)",
}: Options = {}) {
  const ref = useRef<T>(null);

  const trigger = useCallback(
    (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      // Respect reduced motion
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const rect = el.getBoundingClientRect();
      let x: number, y: number;

      if ("touches" in e && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else if ("clientX" in e) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else {
        x = rect.width / 2;
        y = rect.height / 2;
      }

      // Radius covering the farthest corner
      const dx = Math.max(x, rect.width - x);
      const dy = Math.max(y, rect.height - y);
      const radius = Math.sqrt(dx * dx + dy * dy);

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${radius * 2}px`;
      ripple.style.left = `${x - radius}px`;
      ripple.style.top = `${y - radius}px`;
      ripple.style.background = color;
      ripple.style.animationDuration = `${duration}ms`;

      el.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, duration);
    },
    [duration, color]
  );

  return { ref, trigger };
}