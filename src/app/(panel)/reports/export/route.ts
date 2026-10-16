import { NextResponse } from "next/server";
import { csvEscape } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import {
  isValidDateParam,
  getTodayParam,
  dayRange,
} from "@/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("date");
  const date = isValidDateParam(raw) ? raw : getTodayParam();
  const { start, end } = dayRange(date);

  const customerIdRaw = searchParams.get("customer");
  const customerId =
    customerIdRaw && customerIdRaw.trim() ? customerIdRaw : null;

  const orders = await prisma.order.findMany({
    where: {
      status: "paid",
      createdAt: { gte: start, lte: end },
      ...(customerId ? { customerId } : {}),
    },
    include: {
      customer: {
        select: { name: true, subscriptionCode: true },
      },
      items: {
        include: {
          menuItem: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const lines: string[] = [];

  lines.push(
    "شماره سفارش,ساعت,نوع سفارش,مشتری,کد اشتراک,تعداد آیتم,مجموع,تخفیف,قابل پرداخت,آیتم‌ها"
  );

  for (const order of orders) {
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
    const finalPrice = Math.max(0, order.totalPrice - order.discountAmount);
    const itemsText = order.items
      .map((i) => `${i.menuItem.name} × ${i.quantity}`)
      .join(" | ");
    const time = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(order.createdAt);

    lines.push(
      [
        csvEscape(order.id.slice(-6)),
        csvEscape(time),
        csvEscape(order.orderType ?? ""),
        csvEscape(order.customer?.name ?? ""),
        csvEscape(order.customer?.subscriptionCode ?? ""),
        csvEscape(itemCount),
        csvEscape(order.totalPrice),
        csvEscape(order.discountAmount),
        csvEscape(finalPrice),
        csvEscape(itemsText),
      ].join(",")
    );
  }

  // Keep the exported total consistent with the per-order payable amount
  // shown in OrderCard and the daily reports (never allow a negative payable).
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Math.max(0, order.totalPrice - order.discountAmount),
    0
  );

  lines.push("");
  lines.push(`تعداد سفارش پرداخت‌شده,${orders.length}`);
  lines.push(`فروش کل خالص,${totalRevenue}`);

  const csv = "\uFEFF" + lines.join("\r\n");
  const filename = customerId
    ? `report-${date}-customer.csv`
    : `report-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}