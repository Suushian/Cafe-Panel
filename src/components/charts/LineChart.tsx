"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";

type Point = {
  label: string;
  value: number;
};

type Props = {
  data: Point[];
  height?: number;
  showGrid?: boolean;
  unitLabel?: string;
};

const PADDING = { top: 20, right: 16, bottom: 32, left: 64 };

export default function LineChart({
  data,
  height = 260,
  showGrid = true,
  unitLabel = "تومان",
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 640; // viewBox width

  const { maxV, minV, points, pathLine, pathArea, gridLines, yTicks } =
    useMemo(() => {
      const values = data.map((d) => d.value);
      const maxV = Math.max(...values, 1);
      const minV = 0;

      // round up max to nice number
      const order = Math.pow(10, Math.floor(Math.log10(maxV)));
      const niceMax = Math.ceil(maxV / order) * order;

      const innerW = width - PADDING.left - PADDING.right;
      const innerH = height - PADDING.top - PADDING.bottom;

      const pts = data.map((d, i) => {
        const x =
          PADDING.left +
          (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
        const y =
          PADDING.top + innerH - ((d.value - minV) / (niceMax - minV)) * innerH;
        return { x, y, ...d };
      });

      const pathLine = pts
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(" ");

      const pathArea =
        pathLine +
        ` L ${pts[pts.length - 1].x} ${height - PADDING.bottom}` +
        ` L ${pts[0].x} ${height - PADDING.bottom} Z`;

      const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = PADDING.top + innerH * f;
        return { y, value: Math.round(niceMax * (1 - f)) };
      });

      const yTicks = gridLines.map((g) => ({
        y: g.y,
        label: compactNumber(g.value),
      }));

      return {
        maxV: niceMax,
        minV,
        points: pts,
        pathLine,
        pathArea,
        gridLines,
        yTicks,
      };
    }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-text-muted">
        داده‌ای برای نمایش نیست
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl" dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: `${height}px`, maxHeight: `${height}px` }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A67C5B" />
            <stop offset="100%" stopColor="#6F4E37" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A67C5B" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#A67C5B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid &&
          gridLines.map((g, i) => (
            <line
              key={i}
              x1={PADDING.left}
              y1={g.y}
              x2={width - PADDING.right}
              y2={g.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
              strokeDasharray={i === gridLines.length - 1 ? "0" : "3 5"}
              opacity="0.6"
            />
          ))}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={i}
            x={PADDING.left - 10}
            y={t.y + 4}
            textAnchor="end"
            className="fill-text-soft text-[11px] font-medium"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {t.label}
          </text>
        ))}

        {/* Area */}
        <path d={pathArea} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={pathLine}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => {
          const active = hoverIdx === i;
          return (
            <g key={i}>
              {/* invisible hit area */}
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
              />
              {/* visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 5 : 3}
                fill="var(--primary)"
                stroke="var(--surface)"
                strokeWidth="2"
                style={{
                  transition: "r 200ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 10}
            textAnchor="middle"
            className={`text-[11px] font-medium ${
              hoverIdx === i ? "fill-primary" : "fill-text-muted"
            }`}
          >
            {p.label}
          </text>
        ))}
      </svg>

      {/* Tooltip (HTML overlay on hover) */}
      {hoverIdx !== null && points[hoverIdx] && (
        <div
          className="absolute pointer-events-none animate-scale-in"
          style={{
            left: `${(points[hoverIdx].x / width) * 100}%`,
            top: `${(points[hoverIdx].y / height) * 100}%`,
            transform: "translate(-50%, -120%)",
          }}
        >
          <div className="bg-text text-surface text-xs rounded-xl px-2.5 py-1.5 shadow-lg whitespace-nowrap">
            <div className="font-bold tabular-nums">
              {formatPrice(points[hoverIdx].value)}
            </div>
            <div className="opacity-80 text-2xs mt-0.5">
              {points[hoverIdx].label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}