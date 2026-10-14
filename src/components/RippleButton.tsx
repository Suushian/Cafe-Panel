"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useRipple } from "@/lib/use-ripple";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost";
};

const VARIANT_CLASS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "btn-primary",
  danger:
    "relative overflow-hidden bg-danger text-white rounded-2xl px-4 py-2 font-medium hover:brightness-105 transition-all",
  ghost:
    "relative overflow-hidden px-4 py-2 rounded-xl text-sm text-text hover:bg-bg transition-colors",
};

const RippleButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", className = "", children, ...rest }, forwardedRef) => {
    const { ref, trigger } = useRipple<HTMLButtonElement>();

    const setRefs = (node: HTMLButtonElement | null) => {
      (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
    };

    return (
      <button
        ref={setRefs}
        onMouseDown={trigger}
        className={`${VARIANT_CLASS[variant]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;