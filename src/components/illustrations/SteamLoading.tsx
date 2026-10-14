type Props = {
  size?: number;
  label?: string;
  className?: string;
};

export default function SteamLoading({
  size = 120,
  label,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Steam lines rising from a small cup outline */}
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          fill="none"
          aria-hidden="true"
          className="text-primary"
        >
          {/* Small cup outline */}
          <path
            d="M 30 80 Q 32 110 60 112 Q 88 110 90 80 Z"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="2"
            fill="none"
          />
          {/* Rim */}
          <ellipse
            cx="60"
            cy="80"
            rx="30"
            ry="6"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="2"
            fill="none"
          />
          {/* Coffee hint inside */}
          <ellipse
            cx="60"
            cy="80"
            rx="24"
            ry="4"
            fill="currentColor"
            fillOpacity="0.15"
          />

          {/* Steam lines — three curvy lines */}
          <path
            d="M 50 70 Q 46 58 52 48 Q 58 38 52 26"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="steam-path"
            style={{ animationDelay: "0ms" }}
          />
          <path
            d="M 60 68 Q 56 55 62 45 Q 68 35 62 22"
            stroke="currentColor"
            strokeOpacity="0.65"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="steam-path"
            style={{ animationDelay: "200ms" }}
          />
          <path
            d="M 70 70 Q 66 58 72 48 Q 78 38 72 26"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="steam-path"
            style={{ animationDelay: "400ms" }}
          />
        </svg>
      </div>

      {label && (
        <p className="text-xs text-text-muted tracking-wide">{label}</p>
      )}
    </div>
  );
}