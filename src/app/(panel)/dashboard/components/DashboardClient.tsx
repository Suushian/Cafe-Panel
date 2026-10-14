"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ReceiptText,
  Users,
  UtensilsCrossed,
  Sparkles,
  TrendingUp,
  PieChart,
} from "lucide-react";
import KpiCard from "./KpiCard";
import LineChart from "@/components/charts/LineChart";
import DonutChart, { type DonutSlice } from "@/components/charts/DonutChart";
import RecentOrdersList from "./RecentOrdersList";
import QuickActions from "./QuickActions";

type CategoryDatum = { label: string; value: number };

type RecentOrder = {
  id: string;
  status: string;
  orderType: string;
  totalPrice: number;
  discountAmount: number;
  createdAt: Date;
  customer: { name: string } | null;
  itemCount: number;
};

type Props = {
  todayRevenue: number;
  todayOrders: number;
  openOrders: number;
  customersTotal: number;
  menuItems: number;
  unavailableMenu: number;
  weekData: { label: string; value: number }[];
  categoryData: CategoryDatum[];
  recentOrders: RecentOrder[];
};

const CATEGORY_COLORS = [
  "#6F4E37",
  "#A67C5B",
  "#C8956B",
  "#8A6A52",
  "#4A7C59",
  "#9B3A2E",
  "#3F2B1F",
  "#D4A574",
];

export default function DashboardClient({
  todayRevenue,
  todayOrders,
  openOrders,
  customersTotal,
  menuItems,
  unavailableMenu,
  weekData,
  categoryData,
  recentOrders,
}: Props) {
  const [greeting, setGreeting] = useState("سلام");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    if (h < 12) setGreeting("صبح بخیر");
    else if (h < 17) setGreeting("عصر بخیر");
    else setGreeting("شب بخیر");
  }, []);

  const weekTotal = weekData.reduce((s, d) => s + d.value, 0);
  const yesterday = weekData[weekData.length - 2]?.value ?? 0;
  const today = weekData[weekData.length - 1]?.value ?? 0;
  let trendText = "";
  if (yesterday > 0) {
    const pct = Math.round(((today - yesterday) / yesterday) * 100);
    trendText = pct >= 0 ? `+${pct}٪ از دیروز` : `${pct}٪ از دیروز`;
  }

  const slices: DonutSlice[] = categoryData.map((d, i) => ({
    label: d.label,
    value: d.value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const categoryTotal = categoryData.reduce((s, d) => s + d.value, 0);
  const centerValue = compactNumber(categoryTotal);

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting banner */}
      <div className="card flex items-center justify-between gap-4 animate-fade-up relative overflow-hidden">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">
            {mounted ? greeting : "سلام"}
          </span>
          <h2 className="text-xl font-bold text-text tracking-tight">
            خوش آمدی، مدیر کافه
          </h2>
          <span className="text-xs text-text-soft mt-1">
            امروز روز خوبی برای فروش بیشتر است
          </span>
        </div>
        <span className="flex items-center justify-center w-14 h-14 rounded-3xl bg-primary/10 text-primary shrink-0">
          <Sparkles size={26} strokeWidth={2} />
        </span>
      </div>

      {/* Quick Actions */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: "150ms" }}
      >
        <QuickActions />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="فروش امروز"
          value={todayRevenue}
          suffix="تومان"
          icon={Wallet}
          tone="success"
          trend={trendText || undefined}
          index={0}
        />
        <KpiCard
          label="سفارش‌های پرداخت‌شده"
          value={todayOrders}
          icon={ReceiptText}
          tone="primary"
          hint={openOrders > 0 ? `${openOrders} سفارش باز` : "بدون سفارش باز"}
          index={1}
        />
        <KpiCard
          label="مشتریان"
          value={customersTotal}
          icon={Users}
          tone="info"
          hint="کل ثبت‌شده‌ها"
          index={2}
        />
        <KpiCard
          label="آیتم‌های منو"
          value={menuItems}
          icon={UtensilsCrossed}
          tone="primary"
          hint={
            unavailableMenu > 0 ? `${unavailableMenu} ناموجود` : "همه موجود"
          }
          index={3}
        />
      </div>

      {/* Sales chart */}
      <section
        className="card animate-fade-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp size={16} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-text">
                فروش هفته‌ی گذشته
              </h3>
              <span className="text-xs text-text-muted">
                مجموع: {weekTotal.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
          <span className="text-xs text-text-soft hidden sm:block">
            نمایش روزانه (تومان)
          </span>
        </div>

        <LineChart data={weekData} height={260} />
      </section>

      {/* Grid: donut + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category donut */}
        <section
          className="card animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary">
              <PieChart size={16} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-text">
                فروش امروز بر اساس دسته‌بندی
              </h3>
              <span className="text-xs text-text-muted">
                {categoryData.length.toLocaleString("fa-IR")} دسته
              </span>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-text-muted">
              امروز فروشی به‌ثبت نرسیده است
            </div>
          ) : (
            <DonutChart
              data={slices}
              size={180}
              thickness={24}
              centerLabel="مجموع فروش"
              centerValue={centerValue}
            />
          )}
        </section>

        {/* Recent orders */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "500ms" }}
        >
          <RecentOrdersList orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}