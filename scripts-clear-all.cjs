const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
const adapter = new PrismaLibSql({ url: pathToFileURL(dbPath).href });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.CAFE_PANEL_CONFIRM_CLEAR !== "YES") {
    throw new Error("Refusing to clear data. Set CAFE_PANEL_CONFIRM_CLEAR=YES to confirm this destructive operation.");
  }

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
