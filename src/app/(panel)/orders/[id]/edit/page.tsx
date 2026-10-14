import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import NewOrderClient from "../../new/components/NewOrderClient";
import { isOrderType, type OrderType } from "@/lib/order-type";
import { isDiscountType, type DiscountType } from "@/lib/discount";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditOrderPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!order) notFound();
  if (order.status !== "open") redirect("/orders");

  const [items, customers] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Only keep items that are still available (for cart)
  const availableIds = new Set(items.map((i) => i.id));
  const initialCart = order.items
    .filter((line) => availableIds.has(line.menuItemId))
    .map((line) => ({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
    }));

  // If some original items are unavailable, we don't include them silently.
  // (Alternative: show a warning; for MVP we skip.)

  const initialOrderType: OrderType = isOrderType(order.orderType)
    ? order.orderType
    : "dine_in";

  const initialDiscountType: DiscountType = isDiscountType(order.discountType)
    ? order.discountType
    : "none";

  const initialCustomer =
    order.customer && customers.find((c) => c.id === order.customer!.id)
      ? order.customer
      : null;

  return (
    <>
      <Header title="ویرایش سفارش" />
      <NewOrderClient
        items={items}
        customers={customers}
        mode="edit"
        orderId={order.id}
        initialCart={initialCart}
        initialOrderType={initialOrderType}
        initialCustomer={initialCustomer}
        initialDiscountType={initialDiscountType}
        initialDiscountValue={order.discountValue}
      />
    </>
  );
}