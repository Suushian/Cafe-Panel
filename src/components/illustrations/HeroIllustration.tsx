type Props = {
  size?: number;
};

export default function HeroIllustration({ size = 480 }: Props) {
  return (
    <div
      className="relative w-full"
      style={{ maxWidth: size, aspectRatio: "1 / 1" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full text-primary"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cupFill" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="#8A6A52" />
            <stop offset="45%" stopColor="#6F4E37" />
            <stop offset="100%" stopColor="#3F2B1F" />
          </linearGradient>
        </defs>

        {/* Background soft circle */}
        <circle
          cx="160"
          cy="165"
          r="125"
          fill="currentColor"
          opacity="0.06"
        />

        {/* ==== Handle (behind body) ==== */}
        <path
          d="M 222 145 Q 288 145 288 180 Q 288 218 222 218"
          fill="none"
          stroke="url(#cupFill)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* ==== Cup body ==== */}
        <path
          d="M 82 115 Q 85 250 160 256 Q 235 250 238 115 Z"
          fill="url(#cupFill)"
        />

        {/* Body left highlight */}
        <path
          d="M 102 135 Q 96 210 132 246"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />

        {/* ==== Coffee inside ==== */}
        <ellipse cx="160" cy="115" rx="78" ry="17" fill="#3F2B1F" />
        <ellipse cx="160" cy="115" rx="58" ry="10" fill="#2A1A0F" />

        {/* ==== Rim ==== */}
        <ellipse
          cx="160"
          cy="115"
          rx="78"
          ry="17"
          fill="none"
          stroke="#4A3425"
          strokeWidth="2.5"
        />

        {/* Rim shine */}
        <path
          d="M 92 108 Q 126 95 160 95 Q 194 95 228 108"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ==== Steam (3 simple lines with animation) ==== */}
        <g
          stroke="#A67C5B"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        >
          <path
            d="M 135 78 Q 130 62 140 46 Q 150 30 145 14"
            opacity="0.5"
            className="ill-steam"
            style={{ animationDelay: "0s" }}
          />
          <path
            d="M 160 72 Q 155 56 165 40 Q 175 24 170 8"
            opacity="0.65"
            className="ill-steam"
            style={{ animationDelay: "0.5s" }}
          />
          <path
            d="M 185 78 Q 180 62 190 46 Q 200 30 195 14"
            opacity="0.5"
            className="ill-steam"
            style={{ animationDelay: "1s" }}
          />
        </g>

        {/* ==== Small bean (decorative) ==== */}
        <g
          transform="translate(58 245) rotate(-30)"
          className="ill-float"
          style={{ animationDelay: "0.3s" }}
        >
          <ellipse rx="9" ry="13" fill="#6F4E37" opacity="0.45" />
          <line
            x1="0"
            y1="-10"
            x2="0"
            y2="10"
            stroke="#3F2B1F"
            strokeWidth="1.3"
            opacity="0.65"
          />
        </g>

        {/* ==== Small sparkle ==== */}
        <g
          className="ill-pulse"
          style={{ animationDelay: "0.7s" }}
        >
          <path
            d="M 255 78 L 257 84 L 263 86 L 257 88 L 255 94 L 253 88 L 247 86 L 253 84 Z"
            fill="#A67C5B"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}