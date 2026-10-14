import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import MenuItemFormDialog from "./components/MenuItemFormDialog";
import MenuPageClient from "./components/MenuPageClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <Header title="منو" action={<MenuItemFormDialog mode="add" />} />
      <MenuPageClient items={items} />
    </>
  );
}