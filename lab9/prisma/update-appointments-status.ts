// prisma/update-appointments-status.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Обновляем все записи на статус "pending"
  const result = await prisma.appointment.updateMany({
    data: {
      status: "pending",
    },
  });

  console.log(`✅ Обновлено ${result.count} записей на статус "pending"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
