import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import CustomerFormDialog from "./components/CustomerFormDialog";
import CustomersPageClient from "./components/CustomersPageClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const [customers, orderCounts] = await Promise.all([
    prisma.customer.findMany({
      orderBy: [{ name: "asc" }],
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      _count: { _all: true },
    }),
  ]);

  // build map: customerId -> count
  const counts: Record<string, number> = {};
  for (const entry of orderCounts) {
    if (entry.customerId) counts[entry.customerId] = entry._count._all;
  }

  return (
    <>
      <Header
        title="مشتریان"
        action={<CustomerFormDialog mode="add" />}
      />
      <CustomersPageClient customers={customers} orderCounts={counts} />
    </>
  );
}