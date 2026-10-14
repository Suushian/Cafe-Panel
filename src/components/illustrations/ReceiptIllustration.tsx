type Props = {
  size?: number;
  className?: string;
};

export default function ReceiptIllustration({
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

      {/* Receipt paper */}
      <path
        d="M 60 40 L 140 40 L 140 165 L 130 158 L 120 165 L 110 158 L 100 165 L 90 158 L 80 165 L 70 158 L 60 165 Z"
        fill="currentColor"
        fillOpacity="0.10"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Text lines */}
      <line
        x1="72"
        y1="62"
        x2="120"
        y2="62"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="72"
        y1="76"
        x2="128"
        y2="76"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="72"
        y1="88"
        x2="110"
        y2="88"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Divider */}
      <line
        x1="72"
        y1="105"
        x2="128"
        y2="105"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      {/* More lines */}
      <line
        x1="72"
        y1="120"
        x2="120"
        y2="120"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="72"
        y1="132"
        x2="105"
        y2="132"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Total line (bold) */}
      <line
        x1="72"
        y1="148"
        x2="128"
        y2="148"
        stroke="currentColor"
        strokeOpacity="0.60"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Small sparkles */}
      <circle cx="40" cy="70" r="2.5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="160" cy="60" r="2" fill="currentColor" fillOpacity="0.28" />
      <circle cx="45" cy="140" r="2" fill="currentColor" fillOpacity="0.20" />
      <circle cx="165" cy="150" r="2.5" fill="currentColor" fillOpacity="0.22" />

      {/* Small stars */}
      <path
        d="M 32 100 L 34 104 L 38 105 L 34 106 L 32 110 L 30 106 L 26 105 L 30 104 Z"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <path
        d="M 172 90 L 173.5 93 L 177 94 L 173.5 95 L 172 98 L 170.5 95 L 167 94 L 170.5 93 Z"
        fill="currentColor"
        fillOpacity="0.35"
      />
    </svg>
  );
}