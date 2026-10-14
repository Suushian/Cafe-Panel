type Props = {
  size?: number;
  className?: string;
};

export default function BrokenCup({ size = 220, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brokenCupBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.30" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.50" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="coffeeSpill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.10" />
        </linearGradient>
      </defs>

      {/* Background dotted circle */}
      <circle
        cx="110"
        cy="115"
        r="88"
        stroke="currentColor"
        strokeOpacity="0.10"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        fill="none"
      />

      {/* Coffee spill puddle */}
      <ellipse
        cx="110"
        cy="185"
        rx="65"
        ry="10"
        fill="url(#coffeeSpill)"
      />

      {/* Broken cup body (left side attached, right side detached) */}
      {/* Left half */}
      <path
        d="M 55 80 Q 58 155 95 165 L 95 80 Z"
        fill="url(#brokenCupBody)"
      />
      {/* Right fragment (separated) */}
      <path
        d="M 130 82 Q 145 105 145 130 L 130 165 L 122 160 Q 128 120 125 82 Z"
        fill="url(#brokenCupBody)"
        opacity="0.85"
        transform="rotate(8 130 120)"
      />

      {/* Broken edge (jagged line) */}
      <path
        d="M 95 80 L 98 95 L 93 105 L 100 118 L 94 132 L 102 145 L 96 160 L 95 165"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M 125 82 L 122 98 L 128 108 L 124 122 L 130 135 L 126 148 L 130 158 L 122 160"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.8"
        fill="none"
      />

      {/* Rim of left side */}
      <path
        d="M 55 80 Q 75 72 95 80"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        fill="none"
      />
      {/* Rim of right fragment */}
      <path
        d="M 125 82 Q 138 76 145 82"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        fill="none"
      />

      {/* Handle (broken piece) */}
      <path
        d="M 148 90 Q 175 95 178 118 Q 178 140 155 148"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Missing steam above crack */}
      <path
        d="M 80 55 Q 82 45 80 35"
        stroke="currentColor"
        strokeOpacity="0.20"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 100 50 Q 102 38 100 26"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="2 4"
      />

      {/* Small scattered debris */}
      <rect
        x="78"
        y="175"
        width="4"
        height="4"
        rx="1"
        fill="currentColor"
        fillOpacity="0.35"
        transform="rotate(20 80 177)"
      />
      <rect
        x="138"
        y="178"
        width="5"
        height="3"
        rx="1"
        fill="currentColor"
        fillOpacity="0.30"
        transform="rotate(-15 140 180)"
      />
      <circle cx="118" cy="182" r="1.5" fill="currentColor" fillOpacity="0.30" />

      {/* Small accent dots */}
      <circle cx="30" cy="90" r="2.5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="190" cy="70" r="2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="42" cy="150" r="2" fill="currentColor" fillOpacity="0.20" />
      <circle cx="185" cy="155" r="2.5" fill="currentColor" fillOpacity="0.22" />

      {/* Small stars */}
      <path
        d="M 25 60 L 27 64 L 31 65 L 27 66 L 25 70 L 23 66 L 19 65 L 23 64 Z"
        fill="currentColor"
        fillOpacity="0.30"
      />
      <path
        d="M 195 100 L 196.5 103 L 200 104 L 196.5 105 L 195 108 L 193.5 105 L 190 104 L 193.5 103 Z"
        fill="currentColor"
        fillOpacity="0.28"
      />
    </svg>
  );
}