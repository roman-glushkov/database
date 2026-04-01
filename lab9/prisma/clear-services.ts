import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️ Удаляем все услуги...");

  const count = await prisma.service.count();
  console.log(`📊 Найдено услуг: ${count}`);

  await prisma.service.deleteMany({});

  console.log(`✅ Удалено ${count} услуг`);
  console.log(`📊 Осталось услуг: ${await prisma.service.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
