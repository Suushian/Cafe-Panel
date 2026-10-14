const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "data", "cafe.db")}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. اول سفارشات (cascade روی OrderItem)
  const orders = await prisma.order.deleteMany();
  console.log("Orders deleted:", orders.count);

  // 2. الان می‌تونیم منو رو پاک کنیم
  const items = await prisma.menuItem.deleteMany();
  console.log("Menu items deleted:", items.count);

  // 3. تأیید
  const o = await prisma.order.count();
  const m = await prisma.menuItem.count();
  console.log("Remaining -> orders:", o, "menuItems:", m);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("FAILED:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
