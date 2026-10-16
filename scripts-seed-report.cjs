const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
const adapter = new PrismaLibSql({ url: pathToFileURL(dbPath).href });
const prisma = new PrismaClient({ adapter });

async function main() {
  const menu = await prisma.menuItem.findMany();
  if (menu.length < 4) { console.log("Seed at least 4 menu items first"); return; }

  const now = new Date();
  const scenarios = [
    { status: "paid", lines: [{ i: 0, q: 4 }, { i: 1, q: 3 }] },
    { status: "paid", lines: [{ i: 1, q: 2 }] },
    { status: "paid", lines: [{ i: 2, q: 5 }, { i: 0, q: 2 }] },
    { status: "open", lines: [{ i: 3, q: 1 }] }, // نباید در گزارش بیاید
  ];

  for (const s of scenarios) {
    const lines = s.lines.map(({ i, q }) => ({
      menuItemId: menu[i].id,
      quantity: q,
      unitPrice: menu[i].price,
    }));
    const totalPrice = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    await prisma.order.create({
      data: {
        status: s.status,
        totalPrice,
        items: { create: lines },
      },
    });
  }
  const count = await prisma.order.count();
  console.log("TOTAL ORDERS:", count);
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
