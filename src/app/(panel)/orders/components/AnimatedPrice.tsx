"use client";

import { useCountUp } from "@/lib/use-count-up";

export default function AnimatedPrice({ value }: { value: number }) {
  const { ref, value: shown } = useCountUp(value);
  return (
    <span ref={ref} className="tabular-nums">
      {shown.toLocaleString("fa-IR")} تومان
    </span>
  );
}