"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { User, X } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
};

type Props = {
  customers: Customer[];
  currentCustomerId: string | null;
};

export default function CustomerFilter({ customers, currentCustomerId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(currentCustomerId ?? "");

  // Sync when URL changes externally
  useEffect(() => {
    setValue(currentCustomerId ?? "");
  }, [currentCustomerId]);

  function handleChange(newId: string) {
    setValue(newId);
    const params = new URLSearchParams(searchParams.toString());
    if (newId) params.set("customer", newId);
    else params.delete("customer");
    router.push(`/reports?${params.toString()}`);
  }

  function clear() {
    handleChange("");
  }

  return (
    <div className="card mb-6 flex items-center gap-3 animate-fade-up">
      <span className="flex items-center justify-center w-8 h-8 rounded-card-sm bg-primary/10 text-primary shrink-0">
        <User size={15} strokeWidth={2.2} />
      </span>

      <span className="text-xs text-text-muted shrink-0">مشتری:</span>

      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 bg-transparent border-0 outline-none text-sm text-text cursor-pointer"
      >
        <option value="">همه‌ی مشتریان</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — {c.subscriptionCode}
          </option>
        ))}
      </select>

      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-text-muted hover:text-red-700 transition-colors shrink-0"
          aria-label="حذف فیلتر"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}