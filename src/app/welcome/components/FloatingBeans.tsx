const beans = [
  { top: "12%", left: "8%", size: 22, rotate: 25, delay: "0s", duration: "7s" },
  { top: "22%", right: "10%", size: 28, rotate: -15, delay: "1.2s", duration: "8s" },
  { bottom: "18%", left: "12%", size: 18, rotate: 45, delay: "2.4s", duration: "6.5s" },
  { bottom: "26%", right: "8%", size: 24, rotate: -30, delay: "0.8s", duration: "7.5s" },
  { top: "45%", left: "4%", size: 16, rotate: 70, delay: "3.1s", duration: "9s" },
  { top: "60%", right: "5%", size: 20, rotate: -50, delay: "1.8s", duration: "8.2s" },
] as const;

export default function FloatingBeans() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {beans.map((b, i) => (
        <span
          key={i}
          className="bean absolute"
          style={{
            top: "top" in b ? b.top : undefined,
            bottom: "bottom" in b ? b.bottom : undefined,
            left: "left" in b ? b.left : undefined,
            right: "right" in b ? b.right : undefined,
            width: `${b.size}px`,
            height: `${Math.round(b.size * 1.25)}px`,
            transform: `rotate(${b.rotate}deg)`,
            animation: `float ${b.duration} ease-in-out ${b.delay} infinite`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}