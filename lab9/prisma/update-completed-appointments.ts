// prisma/update-completed-appointments.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Указываем дату截止 (включительно до 07.04.2026)
  const cutoffDate = new Date(2026, 3, 7, 23, 59, 59); // 07.04.2026 23:59:59

  console.log(
    `📅 Обновляем записи до ${cutoffDate.toLocaleString("ru-RU")}...\n`
  );

  // Находим все записи до указанной даты
  const appointmentsToUpdate = await prisma.appointment.findMany({
    where: {
      date: {
        lte: cutoffDate,
      },
      status: {
        not: "cancelled", // Не трогаем отмененные
      },
    },
    include: {
      client: true,
      barber: true,
      service: true,
    },
  });

  console.log(
    `📊 Найдено записей для обновления: ${appointmentsToUpdate.length}`
  );

  let updatedCount = 0;
  let workCreatedCount = 0;

  for (const appointment of appointmentsToUpdate) {
    // Обновляем статус appointment
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "completed" },
    });
    updatedCount++;

    // Проверяем, существует ли уже Work для этой записи
    const existingWork = await prisma.work.findFirst({
      where: {
        barberId: appointment.barberId,
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        workDate: appointment.date,
      },
    });

    // Если Work не существует - создаем
    if (!existingWork) {
      await prisma.work.create({
        data: {
          barberId: appointment.barberId,
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          workDate: appointment.date,
        },
      });
      workCreatedCount++;

      // Обновляем firstVisit у клиента, если это первый визит
      const clientWorks = await prisma.work.count({
        where: { clientId: appointment.clientId },
      });

      if (clientWorks === 1) {
        await prisma.client.update({
          where: { id: appointment.clientId },
          data: { firstVisit: appointment.date },
        });
      }
    }
  }

  console.log(`\n✅ Результаты:`);
  console.log(`   - Обновлено appointments: ${updatedCount}`);
  console.log(`   - Создано works: ${workCreatedCount}`);

  // Статистика по месяцам
  const stats = await prisma.appointment.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log(`\n📊 Текущая статистика статусов:`);
  stats.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat._count}`);
  });

  // Статистика по выполненным работам
  const worksCount = await prisma.work.count();
  console.log(`\n💈 Всего выполненных работ (Works): ${worksCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
