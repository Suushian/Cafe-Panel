const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
const adapter = new PrismaLibSql({ url: pathToFileURL(dbPath).href });
const prisma = new PrismaClient({ adapter });

const items = [
  { name: "اسپرسو", price: 45000, category: "نوشیدنی گرم", isAvailable: true },
  { name: "لاته", price: 85000, category: "نوشیدنی گرم", isAvailable: true },
  { name: "آیس آمریکانو", price: 70000, category: "نوشیدنی سرد", isAvailable: true },
  { name: "چیزکیک نیویورکی", price: 120000, category: "کیک و دسر", isAvailable: true },
  { name: "براونی", price: 95000, category: "کیک و دسر", isAvailable: false },
];

async function main() {
  const existing = await prisma.menuItem.count();
  if (existing > 0) {
    console.log(`Seed skipped: database already contains ${existing} menu items. No existing data was changed.`);
    return;
  }

  await prisma.$transaction(items.map((item) => prisma.menuItem.create({ data: item })));
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
