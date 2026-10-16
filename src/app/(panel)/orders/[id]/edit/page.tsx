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
    // Include unavailable items so existing order lines remain visible in the cart.
    // The editor requires the user to remove unavailable lines before saving.
    prisma.menuItem.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Preserve every original line. Silently filtering unavailable lines here could
  // delete historical order items when the user edits an unrelated field.
  const initialCart = order.items
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