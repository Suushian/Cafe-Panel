"use client";

import { useCountUp } from "@/lib/use-count-up";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  format?: boolean;
};

export default function AnimatedNumber({
  value,
  suffix,
  prefix,
  className = "",
  format = true,
}: Props) {
  const { ref, value: shown } = useCountUp(value);
  const display = format ? shown.toLocaleString("fa-IR") : String(shown);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {display}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}