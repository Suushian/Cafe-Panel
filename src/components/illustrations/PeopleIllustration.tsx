type Props = {
  size?: number;
  className?: string;
};

export default function PeopleIllustration({
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

      {/* Person 1 (left) */}
      <g opacity="0.85">
        <circle
          cx="72"
          cy="82"
          r="16"
          fill="currentColor"
          fillOpacity="0.40"
        />
        <path
          d="M 46 130 Q 46 105 72 105 Q 98 105 98 130 Z"
          fill="currentColor"
          fillOpacity="0.40"
        />
      </g>

      {/* Person 2 (right, front) */}
      <g opacity="0.95">
        <circle
          cx="130"
          cy="90"
          r="18"
          fill="currentColor"
          fillOpacity="0.65"
        />
        <path
          d="M 100 145 Q 100 118 130 118 Q 160 118 160 145 Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
      </g>

      {/* Subscription badge */}
      <g>
        <rect
          x="132"
          y="72"
          width="32"
          height="20"
          rx="6"
          fill="currentColor"
          fillOpacity="0.9"
        />
        <text
          x="148"
          y="86"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="white"
          fontFamily="Vazirmatn, sans-serif"
        >
          ID
        </text>
      </g>

      {/* Small floating items */}
      <circle cx="42" cy="60" r="2.5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="160" cy="135" r="2" fill="currentColor" fillOpacity="0.25" />
      <circle cx="55" cy="160" r="2" fill="currentColor" fillOpacity="0.20" />
      <circle cx="175" cy="60" r="2" fill="currentColor" fillOpacity="0.22" />

      {/* Sparkles */}
      <path
        d="M 170 105 L 172 109 L 176 110 L 172 111 L 170 115 L 168 111 L 164 110 L 168 109 Z"
        fill="currentColor"
        fillOpacity="0.30"
      />
      <path
        d="M 35 130 L 36.5 133 L 40 134 L 36.5 135 L 35 138 L 33.5 135 L 30 134 L 33.5 133 Z"
        fill="currentColor"
        fillOpacity="0.28"
      />
    </svg>
  );
}