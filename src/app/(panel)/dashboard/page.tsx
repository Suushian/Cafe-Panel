import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./components/DashboardClient";
import { dayRange, getTodayParam, shiftDate } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = getTodayParam();
  const todayRange = dayRange(today);

  // --- Fetch data in parallel ---
  const [
    todayPaidOrders,
    openOrdersCount,
    customersCount,
    menuItemsCount,
    unavailableMenuCount,
    last7DaysOrders,
    todayItems,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: "paid",
        createdAt: { gte: todayRange.start, lte: todayRange.end },
      },
      select: { totalPrice: true, discountAmount: true },
    }),
    prisma.order.count({ where: { status: "open" } }),
    prisma.customer.count(),
    prisma.menuItem.count(),
    prisma.menuItem.count({ where: { isAvailable: false } }),
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = shiftDate(today, -(6 - i));
        const range = dayRange(date);
        return prisma.order
          .findMany({
            where: {
              status: "paid",
              createdAt: { gte: range.start, lte: range.end },
            },
            select: { totalPrice: true, discountAmount: true },
          })
          .then((orders) => ({
            date,
            revenue: orders.reduce(
              (s, o) => s + o.totalPrice - o.discountAmount,
              0
            ),
          }));
      })
    ),
    prisma.orderItem.findMany({
      where: {
        order: {
          status: "paid",
          createdAt: { gte: todayRange.start, lte: todayRange.end },
        },
      },
      include: {
        menuItem: { select: { category: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        orderType: true,
        totalPrice: true,
        discountAmount: true,
        createdAt: true,
        customer: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    }),
  ]);

  // Today's numbers
  const todayRevenue = todayPaidOrders.reduce(
    (s, o) => s + o.totalPrice - o.discountAmount,
    0
  );
  const todayOrderCount = todayPaidOrders.length;

  // Weekly chart data
  const weekData = last7DaysOrders.map((d) => {
    const [y, m, day] = d.date.split("-").map(Number);
    const dt = new Date(y, m - 1, day);
    const label = new Intl.DateTimeFormat("fa-IR", {
      weekday: "short",
    }).format(dt);
    return { label, value: d.revenue };
  });

  // Category breakdown (by revenue today)
  const categoryMap = new Map<string, number>();
  for (const item of todayItems) {
    const cat = item.menuItem.category;
    const revenue = item.unitPrice * item.quantity;
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + revenue);
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Recent orders (flatten itemCount)
  const recentOrders = recentOrdersRaw.map((o) => ({
    id: o.id,
    status: o.status,
    orderType: o.orderType,
    totalPrice: o.totalPrice,
    discountAmount: o.discountAmount,
    createdAt: o.createdAt,
    customer: o.customer,
    itemCount: o.items.reduce((s, it) => s + it.quantity, 0),
  }));

  return (
    <>
      <Header title="داشبورد" />
      <DashboardClient
        todayRevenue={todayRevenue}
        todayOrders={todayOrderCount}
        openOrders={openOrdersCount}
        customersTotal={customersCount}
        menuItems={menuItemsCount}
        unavailableMenu={unavailableMenuCount}
        weekData={weekData}
        categoryData={categoryData}
        recentOrders={recentOrders}
      />
    </>
  );
}