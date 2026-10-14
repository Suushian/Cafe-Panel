"use client";

import { useCallback, useRef } from "react";

type Options = {
  max?: number;      // max rotate deg
  scale?: number;    // hover scale
  perspective?: number;
};

export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 6,
  scale = 1.015,
  perspective = 800,
}: Options = {}) {
  const ref = useRef<T>(null);
  const frame = useRef<number | null>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * max * 2; // rotateX
        const ry = (x - 0.5) * max * 2; // rotateY

        el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      });
    },
    [max, scale, perspective]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    el.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale(1)`;
  }, [perspective]);

  return { ref, onMove, onLeave };
}