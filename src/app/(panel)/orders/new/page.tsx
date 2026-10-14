import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import NewOrderClient from "./components/NewOrderClient";
import { isOrderType, type OrderType } from "@/lib/order-type";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ from?: string }>;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const [items, customers] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.customer.findMany({
      orderBy: [{ name: "asc" }],
    }),
  ]);

  let initialCart: { menuItemId: string; quantity: number }[] = [];
  let initialOrderType: OrderType = "dine_in";
  let initialCustomer: typeof customers[number] | null = null;

  if (sp.from) {
    const source = await prisma.order.findUnique({
      where: { id: sp.from },
      include: { items: true, customer: true },
    });

    if (source) {
      const availableIds = new Set(items.map((i) => i.id));
      initialCart = source.items
        .filter((line) => availableIds.has(line.menuItemId))
        .map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
        }));

      if (isOrderType(source.orderType)) {
        initialOrderType = source.orderType;
      }

      // carry customer if it still exists
      if (source.customer) {
        const stillExists = customers.find((c) => c.id === source.customer!.id);
        initialCustomer = stillExists ?? null;
      }
    }
  }

  return (
    <>
      <Header title={initialCart.length > 0 ? "تکرار سفارش" : "سفارش جدید"} />

      {items.length === 0 ? (
        <div className="card">
          <p className="text-text-muted text-center py-8">
            هیچ آیتم موجودی در منو نیست. ابتدا از صفحه‌ی «منو» آیتم اضافه کن.
          </p>
        </div>
      ) : (
        <NewOrderClient
          items={items}
          customers={customers}
          initialCart={initialCart}
          initialOrderType={initialOrderType}
          initialCustomer={initialCustomer}
        />
      )}
    </>
  );
}