"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { createOrder, updateOrder } from "../../actions";
import { useToast } from "@/components/ToastProvider";
import {
  ORDER_TYPES,
  ORDER_TYPE_LABELS,
  type OrderType,
} from "@/lib/order-type";
import {
  DISCOUNT_LABELS,
  computeDiscountAmount,
  type DiscountType,
} from "@/lib/discount";
import { Percent, Coins, X, Save, Check, Loader2 } from "lucide-react";
import CustomerPicker from "./CustomerPicker";
import RippleButton from "@/components/RippleButton";
import OrderTypeIcon from "@/components/OrderTypeIcon";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

type Customer = {
  id: string;
  name: string;
  subscriptionCode: string;
  phone: string | null;
};

type CartLine = { menuItemId: string; quantity: number };

type Props = {
  items: MenuItem[];
  customers: Customer[];
  mode?: "create" | "edit";
  orderId?: string;
  initialCart?: CartLine[];
  initialOrderType?: OrderType;
  initialCustomer?: Customer | null;
  initialDiscountType?: DiscountType;
  initialDiscountValue?: number;
};

type SubmitState = "idle" | "pending" | "submitted";

export default function NewOrderClient({
  items,
  customers,
  mode = "create",
  orderId,
  initialCart = [],
  initialOrderType = "dine_in",
  initialCustomer = null,
  initialDiscountType = "none",
  initialDiscountValue = 0,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = mode === "edit";

  const [cart, setCart] = useState<CartLine[]>(initialCart);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [discountType, setDiscountType] =
    useState<DiscountType>(initialDiscountType);
  const [discountValue, setDiscountValue] = useState<string>(
    initialDiscountValue > 0 ? String(initialDiscountValue) : ""
  );
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer);

  const itemMap = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items]
  );

  const grouped = useMemo(() => {
    return items.reduce<Record<string, MenuItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const item = itemMap.get(line.menuItemId);
        return sum + (item?.price ?? 0) * line.quantity;
      }, 0),
    [cart, itemMap]
  );

  const discountAmount = useMemo(() => {
    if (discountType === "none") return 0;
    const v = Number(discountValue);
    if (!Number.isFinite(v) || v <= 0) return 0;
    return computeDiscountAmount(subtotal, discountType, v);
  }, [subtotal, discountType, discountValue]);

  const finalPrice = Math.max(0, subtotal - discountAmount);

  function addItem(id: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { menuItemId: id, quantity: 1 }];
    });
  }

  function incLine(id: string) {
    setCart((prev) =>
      prev.map((l) =>
        l.menuItemId === id ? { ...l, quantity: l.quantity + 1 } : l
      )
    );
  }

  function decLine(id: string) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.menuItemId === id ? { ...l, quantity: l.quantity - 1 } : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(id: string) {
    setCart((prev) => prev.filter((l) => l.menuItemId !== id));
  }

  function clearDiscount() {
    setDiscountType("none");
    setDiscountValue("");
  }

  async function handleSubmit() {
    if (cart.length === 0 || submitState !== "idle") return;
    setSubmitState("pending");
    setError(null);

    const fd = new FormData();
    fd.set("cart", JSON.stringify(cart));
    fd.set("orderType", orderType);
    fd.set("discountType", discountType);
    fd.set("discountValue", discountType === "none" ? "0" : discountValue || "0");
    if (customer) fd.set("customerId", customer.id);
    if (isEdit && orderId) fd.set("orderId", orderId);

    const result = isEdit ? await updateOrder(fd) : await createOrder(fd);

    if (result.success) {
      toast.push(
        isEdit ? "تغییرات سفارش ذخیره شد." : "سفارش با موفقیت ثبت شد.",
        "success"
      );
      setSubmitState("submitted");
      // Delay redirect to show the success animation
      setTimeout(() => {
        router.push("/orders");
      }, isEdit ? 500 : 900);
    } else {
      setSubmitState("idle");
      setError(result.error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Menu Picker */}
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([category, catItems]) => (
          <section key={category}>
            <h2 className="text-sm font-medium text-text-muted mb-3">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catItems.map((item) => {
                const disabled = !item.isAvailable;
                const inCart = cart.find((l) => l.menuItemId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => addItem(item.id)}
                    className={`card text-right transition-all ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-primary cursor-pointer"
                    } ${inCart ? "border-primary" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm text-text">
                        {item.name}
                      </span>
                      {inCart && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary text-white shrink-0">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      {disabled ? "ناموجود" : formatPrice(item.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Cart */}
      <aside className="lg:sticky lg:top-6 h-fit">
        <div className="card flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text">سبد سفارش</h2>

          {cart.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              آیتمی انتخاب نشده است.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.map((line) => {
                const item = itemMap.get(line.menuItemId);
                if (!item) return null;
                return (
                  <li
                    key={line.menuItemId}
                    className="flex flex-col gap-2 border-b border-border last:border-0 pb-3 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-text">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeLine(line.menuItemId)}
                        className="text-text-muted hover:text-danger transition-colors"
                        aria-label="حذف"
                      >
                        <X size={14} strokeWidth={2.4} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decLine(line.menuItemId)}
                          className="w-7 h-7 rounded-full border border-border text-text hover:bg-bg transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incLine(line.menuItemId)}
                          className="w-7 h-7 rounded-full border border-border text-text hover:bg-bg transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatPrice(item.price * line.quantity)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Customer Picker */}
          <CustomerPicker
            customers={customers}
            value={customer}
            onChange={setCustomer}
          />

          {/* Order Type */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-xs text-text-muted">نوع سفارش</span>
            <div className="grid grid-cols-3 gap-1.5">
              {ORDER_TYPES.map((t) => {
                const active = orderType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`text-xs py-2 rounded-xl border transition-all duration-250 flex flex-col items-center gap-1 ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-text-muted hover:bg-bg"
                    }`}
                  >
                    <OrderTypeIcon type={t} size={18} strokeWidth={2} />
                    <span>{ORDER_TYPE_LABELS[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">تخفیف</span>
              {discountType !== "none" && (
                <button
                  type="button"
                  onClick={clearDiscount}
                  className="text-xs text-text-muted hover:text-danger transition-colors inline-flex items-center gap-1"
                >
                  <X size={12} />
                  <span>پاک</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(["none", "percent", "amount"] as DiscountType[]).map((t) => {
                const active = discountType === t;
                const Icon =
                  t === "percent" ? Percent : t === "amount" ? Coins : X;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setDiscountType(t);
                      if (t === "none") setDiscountValue("");
                    }}
                    className={`text-xs py-1.5 rounded-xl border transition-all duration-250 inline-flex items-center justify-center gap-1 ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-text-muted hover:bg-bg"
                    }`}
                  >
                    {t !== "none" && <Icon size={12} />}
                    <span>{DISCOUNT_LABELS[t]}</span>
                  </button>
                );
              })}
            </div>

            {discountType !== "none" && (
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={
                  discountType === "percent" ? "مثلاً ۱۰" : "مثلاً ۲۰۰۰۰"
                }
                className="field-input text-sm"
              />
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">مجموع</span>
              <span className="text-text tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-success inline-flex items-center gap-1">
                  تخفیف
                  {discountType === "percent" && (
                    <span className="text-xs">
                      ({Number(discountValue).toLocaleString("fa-IR")}٪)
                    </span>
                  )}
                </span>
                <span className="text-success tabular-nums">
                  − {formatPrice(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-border">
              <span className="text-sm text-text font-medium">قابل پرداخت</span>
              <span className="font-bold text-text text-lg tabular-nums">
                {formatPrice(finalPrice)}
              </span>
            </div>
          </div>

          {error && <p className="alert-error">{error}</p>}

          {/* Submit button with success animation */}
          <RippleButton
            type="button"
            onClick={handleSubmit}
            disabled={submitState !== "idle" || cart.length === 0}
            className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out-expo ${
              submitState === "submitted"
                ? "bg-success! text-white scale-[1.02] success-pulse"
                : ""
            }`}
          >
            {submitState === "pending" && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {submitState === "submitted" && (
              <Check
                size={18}
                strokeWidth={3}
                className="animate-scale-in"
              />
            )}
            {submitState === "idle" && isEdit && (
              <Save size={15} strokeWidth={2.4} />
            )}
            <span>
              {submitState === "submitted"
                ? "ثبت شد"
                : submitState === "pending"
                  ? "..."
                  : isEdit
                    ? "ذخیره تغییرات"
                    : "ثبت سفارش"}
            </span>
          </RippleButton>
        </div>
      </aside>
    </div>
  );
}