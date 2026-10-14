type Props = {
  size?: number;
  className?: string;
};

export default function CoffeeCup({ size = 200, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cupBodyEmpty" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id="cupCoffeeEmpty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Background circle */}
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

      {/* Steam lines (subtle) */}
      <path
        d="M 85 50 Q 88 42 85 34"
        stroke="currentColor"
        strokeOpacity="0.30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 100 46 Q 103 36 100 26"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 115 50 Q 118 42 115 34"
        stroke="currentColor"
        strokeOpacity="0.30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cup handle */}
      <path
        d="M 148 100 Q 175 100 175 122 Q 175 145 148 145"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cup body */}
      <path
        d="M 55 75 Q 58 155 100 160 Q 142 155 145 75 Z"
        fill="url(#cupBodyEmpty)"
      />

      {/* Coffee surface */}
      <ellipse cx="100" cy="75" rx="45" ry="11" fill="url(#cupCoffeeEmpty)" />

      {/* Cup rim */}
      <ellipse
        cx="100"
        cy="75"
        rx="45"
        ry="11"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        fill="none"
      />

      {/* Leaf 1 (top-left) */}
      <g opacity="0.55">
        <path
          d="M 32 65 Q 22 55 30 45 Q 42 45 44 58 Q 42 68 32 65 Z"
          fill="currentColor"
          fillOpacity="0.35"
        />
        <line
          x1="30"
          y1="45"
          x2="42"
          y2="62"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
      </g>

      {/* Leaf 2 (bottom-left) */}
      <g opacity="0.5">
        <path
          d="M 40 130 Q 28 128 26 116 Q 38 110 48 120 Q 48 130 40 130 Z"
          fill="currentColor"
          fillOpacity="0.30"
        />
        <line
          x1="26"
          y1="116"
          x2="45"
          y2="128"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
      </g>

      {/* Leaf 3 (right) */}
      <g opacity="0.45">
        <path
          d="M 168 55 Q 178 48 184 55 Q 180 66 168 64 Q 162 60 168 55 Z"
          fill="currentColor"
          fillOpacity="0.28"
        />
        <line
          x1="184"
          y1="55"
          x2="170"
          y2="61"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
      </g>

      {/* Small dots */}
      <circle cx="48" cy="90" r="2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="158" cy="80" r="1.5" fill="currentColor" fillOpacity="0.25" />
      <circle cx="60" cy="170" r="2" fill="currentColor" fillOpacity="0.18" />
      <circle cx="150" cy="175" r="1.5" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}