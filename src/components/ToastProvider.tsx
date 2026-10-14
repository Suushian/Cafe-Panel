"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, X, Info } from "lucide-react";

type Tone = "success" | "error" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type PushOptions = {
  duration?: number;
  action?: ToastAction;
};

type Toast = {
  id: string;
  message: string;
  tone: Tone;
  state: "enter" | "exit";
  action?: ToastAction;
};

type Ctx = {
  push: (message: string, tone?: Tone, options?: PushOptions) => string;
  dismiss: (id: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const ICONS = {
  success: Check,
  error: X,
  info: Info,
} as const;

const DEFAULT_DURATION = 3200;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state: "exit" } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []);

  const push = useCallback(
    (message: string, tone: Tone = "success", options: PushOptions = {}) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { id, message, tone, state: "enter", action: options.action };
      setToasts((prev) => [...prev, toast]);

      const duration = options.duration ?? DEFAULT_DURATION;
      setTimeout(() => remove(id), duration);

      return id;
    },
    [remove]
  );

  const dismiss = useCallback((id: string) => remove(id), [remove]);

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      {mounted &&
        createPortal(
          <div className="toast-stack" aria-live="polite">
            {toasts.map((t) => {
              const Icon = ICONS[t.tone];
              return (
                <div key={t.id} className="toast" data-state={t.state}>
                  <span className="toast-icon" data-tone={t.tone}>
                    <Icon size={14} strokeWidth={2.6} />
                  </span>
                  <span className="flex-1">{t.message}</span>
                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action!.onClick();
                        remove(t.id);
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-bg2 border border-border-strong hover:bg-bg transition-colors shrink-0 font-medium"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastCtx.Provider>
  );
}