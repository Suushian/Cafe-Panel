"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

type Options = {
  onHelp?: () => void;
};

export function useKeyboardShortcuts({ onHelp }: Options = {}) {
  const router = useRouter();
  const pendingG = useRef(false);
  const gTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearG() {
      pendingG.current = false;
      if (gTimeout.current) {
        clearTimeout(gTimeout.current);
        gTimeout.current = null;
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (pendingG.current) {
        if (key === "d") { clearG(); router.push("/dashboard"); return; }
        if (key === "m") { clearG(); router.push("/menu"); return; }
        if (key === "o") { clearG(); router.push("/orders"); return; }
        if (key === "r") { clearG(); router.push("/reports"); return; }
        if (key === "c") { clearG(); router.push("/customers"); return; }
        clearG();
        return;
      }

      if (key === "g") {
        pendingG.current = true;
        gTimeout.current = setTimeout(clearG, 1200);
        return;
      }

      if (key === "n") {
        router.push("/orders/new");
        return;
      }

      if (key === "?" || (e.shiftKey && key === "/")) {
        if (onHelp) {
          e.preventDefault();
          onHelp();
        }
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearG();
    };
  }, [router, onHelp]);
}