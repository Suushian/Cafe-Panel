import Link from "next/link";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getPayableAmount } from "@/lib/order-total";
import {
  isValidDateParam,
  getTodayParam,
  dayRange,
  shiftDate,
  formatDateParam,
} from "@/lib/date-range";
import SummaryCard from "./components/SummaryCard";
import TopItemsTable from "./components/TopItemsTable";
import BackupIndicator from "./components/BackupIndicator";
import CustomerFilter from "./components/CustomerFilter";
import EmptyState from "@/components/EmptyState";
import ChartIllustration from "@/components/illustrations/ChartIllustration";
import {
  ChevronRight,
  ChevronLeft,
  Download,
  ReceiptText,
  Wallet,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string; customer?: string }>;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const date = isValidDateParam(sp.date) ? sp.date : getTodayParam();
  const { start, end } = dayRange(date);

  const customerId = sp.customer && sp.customer.trim() ? sp.customer : null;

  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, subscriptionCode: true },
    }),
    prisma.order.findMany({
      where: {
        status: "paid",
        createdAt: { gte: start, lte: end },
        ...(customerId ? { customerId } : {}),
      },
      include: { items: true },
    }),
  ]);

  const orderCount = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + getPayableAmount(order.totalPrice, order.discountAmount),
    0
  );
  const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const itemAgg = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  for (const order of orders) {
    for (const line of order.items) {
      const key = line.menuItemId;
      const existing = itemAgg.get(key);
      if (existing) {
        existing.quantity += line.quantity;
        existing.revenue += line.quantity * line.unitPrice;
      } else {
        itemAgg.set(key, {
          name: "",
          quantity: line.quantity,
          revenue: line.quantity * line.unitPrice,
        });
      }
    }
  }

  const menuIds = Array.from(itemAgg.keys());
  if (menuIds.length > 0) {
    const items = await prisma.menuItem.findMany({
      where: { id: { in: menuIds } },
      select: { id: true, name: true },
    });
    for (const m of items) {
      const entry = itemAgg.get(m.id);
      if (entry) entry.name = m.name;
    }
  }

  const topItems = Array.from(itemAgg.values())
    .filter((i) => i.name)
    .sort((a, b) => b.quantity - a.quantity);

  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);
  const todayDate = getTodayParam();
  const nextDisabled = date >= todayDate;

  // build query helpers that preserve customer filter
  function withDate(d: string) {
    const p = new URLSearchParams();
    p.set("date", d);
    if (customerId) p.set("customer", customerId);
    return `/reports?${p.toString()}`;
  }
  function withExport() {
    const p = new URLSearchParams();
    p.set("date", date);
    if (customerId) p.set("customer", customerId);
    return `/reports/export?${p.toString()}`;
  }

  return (
    <>
      <Header
        title="گزارش‌ها"
        action={
          <a
            href={withExport()}
            className="btn-primary text-sm inline-flex items-center gap-1.5"
            download
          >
            <Download size={16} strokeWidth={2.4} />
            <span>خروجی CSV</span>
          </a>
        }
      />

      {/* Customer filter */}
      <CustomerFilter
        customers={customers}
        currentCustomerId={customerId}
      />

      {/* Date navigation */}
      <div className="card mb-6 flex items-center justify-between gap-4">
        <Link
          href={withDate(prevDate)}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors duration-250 group"
        >
          <ChevronRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
          <span>روز قبل</span>
        </Link>

        <span className="text-sm font-medium text-text">
          {formatDateParam(date)}
        </span>

        {nextDisabled ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-text-soft opacity-50 cursor-not-allowed">
            <span>روز بعد</span>
            <ChevronLeft size={16} />
          </span>
        ) : (
          <Link
            href={withDate(nextDate)}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors duration-250 group"
          >
            <span>روز بعد</span>
            <ChevronLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="تعداد سفارش"
          value={orderCount}
          icon={ReceiptText}
          tone="primary"
          index={0}
        />
        <SummaryCard
          label="فروش کل"
          value={totalRevenue}
          suffix="تومان"
          icon={Wallet}
          tone="success"
          index={1}
        />
        <SummaryCard
          label="میانگین سفارش"
          value={avgOrder}
          suffix="تومان"
          icon={TrendingUp}
          tone="accent"
          index={2}
        />
      </div>

      {/* Top items */}
      <section>
        <h2 className="text-sm font-medium text-text-muted mb-3">
          آیتم‌های پرفروش
        </h2>
        {topItems.length === 0 ? (
          <EmptyState
            illustration={<ChartIllustration size={180} />}
            title="در این روز فروشی ثبت نشده"
            description="روز دیگری را از نوار بالا انتخاب کن یا فیلتر مشتری را حذف کن."
          />
        ) : (
          <TopItemsTable items={topItems} />
        )}
      </section>

      <BackupIndicator />
    </>
  );
}