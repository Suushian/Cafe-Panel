const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "data", "cafe.db")}`,
});
const prisma = new PrismaClient({ adapter });

const items = [
  { name: "اسپرسو", price: 45000, category: "نوشیدنی گرم", isAvailable: true },
  { name: "لاته", price: 85000, category: "نوشیدنی گرم", isAvailable: true },
  { name: "آیس آمریکانو", price: 70000, category: "نوشیدنی سرد", isAvailable: true },
  { name: "چیزکیک نیویورکی", price: 120000, category: "کیک و دسر", isAvailable: true },
  { name: "براونی", price: 95000, category: "کیک و دسر", isAvailable: false },
];

async function main() {
  await prisma.menuItem.deleteMany();
  for (const item of items) {
    await prisma.menuItem.create({ data: item });
  }
  const count = await prisma.menuItem.count();
  console.log("SEEDED:", count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
