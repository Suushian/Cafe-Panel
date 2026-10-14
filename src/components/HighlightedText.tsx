type Props = {
  text: string;
  query: string;
  className?: string;
};

export default function HighlightedText({
  text,
  query,
  className = "",
}: Props) {
  const q = query.trim();
  if (!q) {
    return <span className={className}>{text}</span>;
  }

  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];

  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) {
      parts.push({ text: text.slice(i, idx), match: false });
    }
    parts.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.match ? (
          <mark key={i} className="highlight">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}