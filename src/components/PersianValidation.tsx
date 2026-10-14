"use client";

import { useEffect } from "react";
import { persianValidityMessage } from "@/lib/persian-validation";

type FormEl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isFormEl(el: EventTarget | null): el is FormEl {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  );
}

/**
 * Global listener that replaces browser-default validation messages
 * with Persian text. Mount once at the root.
 */
export default function PersianValidation() {
  useEffect(() => {
    function onInvalid(e: Event) {
      if (!isFormEl(e.target)) return;
      e.target.setCustomValidity(persianValidityMessage(e.target));
    }

    function onInput(e: Event) {
      if (!isFormEl(e.target)) return;
      // Clear custom message so validation re-runs on next invalid event
      e.target.setCustomValidity("");
    }

    // capture: true so we catch the events even before React handlers
    document.addEventListener("invalid", onInvalid, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);

    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
    };
  }, []);

  return null;
}