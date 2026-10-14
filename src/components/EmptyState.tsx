import type { ReactNode } from "react";

type Props = {
  illustration: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  illustration,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="card flex flex-col items-center text-center py-12 px-6 animate-fade-up relative overflow-hidden">
      {/* Decorative background orbs */}
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,149,107,0.22) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(111,78,55,0.16) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        {/* Illustration */}
        <div className="text-primary mb-5 animate-fade-up">
          {illustration}
        </div>

        <h3 className="text-base font-semibold text-text mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-text-muted max-w-sm leading-6 mb-5">
            {description}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}