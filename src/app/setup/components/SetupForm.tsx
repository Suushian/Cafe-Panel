"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { setupAdmin } from "../actions";

export default function SetupForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await setupAdmin(formData);

    // Only reached on error (success → redirect)
    setPending(false);
    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="password" className="field-label">
          رمز عبور مدیر
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            maxLength={100}
            autoFocus
            autoComplete="new-password"
            className="field-input pl-11"
            placeholder="حداقل ۶ کاراکتر"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
            aria-label={showPassword ? "پنهان کردن" : "نمایش"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="confirm" className="field-label">
          تکرار رمز عبور
        </label>
        <div className="relative">
          <input
            id="confirm"
            name="confirm"
            type={showConfirm ? "text" : "password"}
            required
            minLength={6}
            maxLength={100}
            autoComplete="new-password"
            className="field-input pl-11"
            placeholder="همان رمز بالا"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
            aria-label={showConfirm ? "پنهان کردن" : "نمایش"}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm alert-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`btn-primary w-full inline-flex items-center justify-center gap-2 ${pending ? "btn-loading" : ""}`}
      >
        <Lock size={16} strokeWidth={2.4} />
        <span>ساخت رمز و ورود</span>
      </button>
    </form>
  );
}