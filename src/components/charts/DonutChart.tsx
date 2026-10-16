"use client";

import { useMemo, useState } from "react";

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

export default function DonutChart({
  data,
  size = 200,
  thickness = 26,
  centerLabel,
  centerValue,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const total = useMemo(
    () => data.reduce((s, d) => s + d.value, 0),
    [data]
  );

  const { slices, radius, innerRadius, cx, cy, circumference } =
    useMemo(() => {
      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 4;
      const innerRadius = radius - thickness;
      const circumference = 2 * Math.PI * ((radius + innerRadius) / 2);

      let offset = 0;
      const slices = data.map((d, i) => {
        const fraction = total > 0 ? d.value / total : 0;
        const dash = circumference * fraction;
        const gap = circumference - dash;
        const item = {
          ...d,
          index: i,
          fraction,
          dash,
          gap,
          offset,
        };
        offset += dash;
        return item;
      });

      return { slices, radius, innerRadius, cx, cy, circumference };
    }, [data, size, thickness, total]);

  if (data.length === 0 || total === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-text-muted"
        style={{ height: size }}
      >
        داده‌ای برای نمایش نیست
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* SVG donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full block"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={(radius + innerRadius) / 2}
            fill="none"
            stroke="var(--border)"
            strokeWidth={thickness}
            opacity="0.35"
          />

          {/* slices */}
          {slices.map((s) => {
            const active = hoverIdx === s.index;
            const r = (radius + innerRadius) / 2;
            const dash = s.dash;
            const gap = s.gap;
            const offset = -s.offset;
            return (
              <circle
                key={s.index}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={active ? thickness + 4 : thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{
                  transition:
                    "stroke-width 250ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease",
                  opacity:
                    hoverIdx === null || active ? 1 : 0.35,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoverIdx(s.index)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ width: size, height: size }}
        >
          {centerValue && (
            <span className="text-lg font-extrabold text-text tabular-nums">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-2xs text-text-muted mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-2 min-w-[140px] flex-1">
        {slices.map((s) => {
          const active = hoverIdx === s.index;
          const pct = Math.round(s.fraction * 100).toLocaleString("fa-IR");
          return (
            <li
              key={s.index}
              onMouseEnter={() => setHoverIdx(s.index)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
                active ? "bg-bg2" : ""
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  background: s.color,
                  transform: active ? "scale(1.25)" : "scale(1)",
                  transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              <span className="text-xs text-text flex-1 truncate">
                {s.label}
              </span>
              <span className="text-2xs text-text-muted tabular-nums">
                {pct}٪
              </span>
              <span className="text-xs font-semibold text-text tabular-nums">
                {s.value.toLocaleString("fa-IR")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}