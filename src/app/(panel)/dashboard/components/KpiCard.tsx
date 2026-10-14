"use client";

import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/app/(panel)/reports/components/AnimatedNumber";

type Tone = "primary" | "success" | "danger" | "info";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  trend?: string;
  index?: number;
};

const toneMap = {
  primary: {
    bg: "bg-primary/10",
    fg: "text-primary",
    ring: "ring-primary/15",
  },
  success: {
    bg: "bg-success-soft",
    fg: "text-success",
    ring: "ring-success/20",
  },
  danger: {
    bg: "bg-danger-soft",
    fg: "text-danger",
    ring: "ring-danger/20",
  },
  info: {
    bg: "bg-accent-cream/40",
    fg: "text-primary-deep",
    ring: "ring-primary/10",
  },
} as const;

export default function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "primary",
  hint,
  trend,
  index = 0,
}: Props) {
  const t = toneMap[tone];

  return (
    <div
      className="card card-hover stagger-item flex flex-col gap-3 relative overflow-hidden group"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-muted font-medium">{label}</span>
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-2xl shrink-0 ${t.bg} ${t.fg} transition-transform duration-400 ease-out-back group-hover:scale-105 group-hover:rotate-[-4deg]`}
        >
          <Icon size={16} strokeWidth={2.2} />
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-text tracking-tight">
          <AnimatedNumber value={value} />
        </span>
        {suffix && (
          <span className="text-xs text-text-muted font-medium">
            {suffix}
          </span>
        )}
      </div>

      {/* Hint / trend */}
      {(hint || trend) && (
        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5">
          {trend && (
            <span className={`text-2xs font-semibold ${t.fg}`}>
              {trend}
            </span>
          )}
          {hint && (
            <span className="text-2xs text-text-soft">{hint}</span>
          )}
        </div>
      )}

      {/* Corner accent */}
      <div
        className={`absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ring-1 ${t.ring}`}
        style={{
          background:
            "radial-gradient(circle, var(--primary-glow-15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}