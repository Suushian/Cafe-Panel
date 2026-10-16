const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
const adapter = new PrismaLibSql({ url: pathToFileURL(dbPath).href });
const prisma = new PrismaClient({ adapter });

async function main() {
  const menu = await prisma.menuItem.findMany();
  console.log("MENU ITEMS:", menu.length);

  if (menu.length < 2) {
    console.log("Need at least 2 menu items. Run node scripts/seed-menu.cjs first.");
    return;
  }

  // ایجاد سفارش تستی
  const order = await prisma.order.create({
    data: {
      status: "open",
      totalPrice: menu[0].price * 2 + menu[1].price,
      items: {
        create: [
          { menuItemId: menu[0].id, quantity: 2, unitPrice: menu[0].price },
          { menuItemId: menu[1].id, quantity: 1, unitPrice: menu[1].price },
        ],
      },
    },
    include: { items: true },
  });

  console.log("ORDER CREATED:", order.id, "TOTAL:", order.totalPrice, "ITEMS:", order.items.length);

  // تست چک استفاده‌شده بودن
  const usage = await prisma.orderItem.count({
    where: { menuItemId: menu[0].id },
  });
  console.log("USAGE COUNT for first item:", usage);

  // پاک‌سازی
  await prisma.order.delete({ where: { id: order.id } });
  console.log("CLEANED UP");

  const orderCount = await prisma.order.count();
  console.log("TOTAL ORDERS:", orderCount);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
