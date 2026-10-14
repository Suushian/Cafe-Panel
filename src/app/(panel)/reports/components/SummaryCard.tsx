import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "accent";
  index?: number;
};

const toneMap = {
  primary: {
    bg: "bg-primary/10",
    fg: "text-primary",
  },
  success: {
    bg: "bg-success-soft",
    fg: "text-success",
  },
  accent: {
    bg: "bg-accent-cream/40",
    fg: "text-primary-deep",
  },
} as const;

export default function SummaryCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "primary",
  index = 0,
}: Props) {
  const t = toneMap[tone];

  return (
    <div
      className="card stagger-item flex items-start justify-between gap-3 group"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-xl font-bold text-text">
          <AnimatedNumber value={value} suffix={suffix} />
        </span>
      </div>
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-card-sm shrink-0 transition-transform duration-400 ease-out-back group-hover:scale-105 group-hover:rotate-[-4deg] ${t.bg} ${t.fg}`}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
    </div>
  );
}