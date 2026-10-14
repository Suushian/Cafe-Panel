"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const MobileMenuCtx = createContext<Ctx | null>(null);

export function useMobileMenu() {
  const ctx = useContext(MobileMenuCtx);
  if (!ctx) throw new Error("useMobileMenu must be used inside MobileMenuProvider");
  return ctx;
}

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <MobileMenuCtx.Provider value={{ open, toggle, close }}>
      {children}
    </MobileMenuCtx.Provider>
  );
}