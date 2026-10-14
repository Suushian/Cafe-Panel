type Props = {
  size?: number;
  className?: string;
};

export default function ChartIllustration({
  size = 200,
  className = "",
}: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Background dotted circle */}
      <circle
        cx="100"
        cy="100"
        r="78"
        stroke="currentColor"
        strokeOpacity="0.10"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        fill="none"
      />

      {/* Axes */}
      <line
        x1="50"
        y1="55"
        x2="50"
        y2="150"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="150"
        x2="155"
        y2="150"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Grid lines */}
      <line
        x1="50"
        y1="120"
        x2="155"
        y2="120"
        stroke="currentColor"
        strokeOpacity="0.10"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <line
        x1="50"
        y1="90"
        x2="155"
        y2="90"
        stroke="currentColor"
        strokeOpacity="0.10"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <line
        x1="50"
        y1="60"
        x2="155"
        y2="60"
        stroke="currentColor"
        strokeOpacity="0.10"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Bars (short, incomplete) */}
      <rect
        x="62"
        y="120"
        width="14"
        height="30"
        rx="3"
        fill="currentColor"
        fillOpacity="0.20"
      />
      <rect
        x="84"
        y="105"
        width="14"
        height="45"
        rx="3"
        fill="currentColor"
        fillOpacity="0.30"
      />
      <rect
        x="106"
        y="115"
        width="14"
        height="35"
        rx="3"
        fill="currentColor"
        fillOpacity="0.20"
      />
      <rect
        x="128"
        y="95"
        width="14"
        height="55"
        rx="3"
        fill="currentColor"
        fillOpacity="0.25"
      />

      {/* Dashed trend line */}
      <path
        d="M 62 100 Q 85 75 108 90 T 145 70"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="5 4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Question mark */}
      <text
        x="100"
        y="42"
        textAnchor="middle"
        fontSize="32"
        fontWeight="800"
        fill="currentColor"
        fillOpacity="0.25"
        fontFamily="Vazirmatn, sans-serif"
      >
        ?
      </text>

      {/* Small dots */}
      <circle cx="35" cy="80" r="2" fill="currentColor" fillOpacity="0.22" />
      <circle cx="170" cy="110" r="2.5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="40" cy="155" r="2" fill="currentColor" fillOpacity="0.20" />
      <circle cx="172" cy="55" r="2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}