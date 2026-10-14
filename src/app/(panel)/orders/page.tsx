import Link from "next/link";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import OrderCard from "./components/OrderCard";
import EmptyState from "@/components/EmptyState";
import ReceiptIllustration from "@/components/illustrations/ReceiptIllustration";
import { Plus, ReceiptText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
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
  });

  return (
    <>
      <Header
        title="سفارش‌ها"
        action={
          <Link
            href="/orders/new"
            className="btn-primary text-sm inline-flex items-center gap-1.5"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>سفارش جدید</span>
          </Link>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          illustration={<ReceiptIllustration size={180} />}
          title="هنوز سفارشی ثبت نشده"
          description="برای ثبت اولین سفارش، از دکمه‌ی «سفارش جدید» استفاده کن."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </div>
      )}
    </>
  );
}