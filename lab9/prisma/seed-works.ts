import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Соответствие специализации парикмахера и категории услуги
const specializationToCategory: Record<string, string[]> = {
  "Мужские стрижки": ["Мужские стрижки"],
  "Женские стрижки": ["Женские стрижки"],
  Окрашивание: ["Окрашивание"],
  Укладка: [
    "Укладка",
    "Стрижка + укладка",
    "Вечерние прически",
    "Свадебные прически",
  ],
  "Стрижка + укладка": [
    "Стрижка + укладка",
    "Мужские стрижки",
    "Женские стрижки",
    "Укладка",
  ],
  "Коррекция бровей": ["Коррекция бровей"],
  "Лечение волос": ["Лечение волос", "Уходовые процедуры"],
  "Уходовые процедуры": ["Уходовые процедуры", "Лечение волос"],
  "Наращивание волос": ["Наращивание волос"],
  "Химическая завивка": ["Химическая завивка"],
  "Вечерние прически": ["Вечерние прически", "Укладка", "Стрижка + укладка"],
  "Свадебные прически": ["Свадебные прически", "Вечерние прически", "Укладка"],
};

interface Service {
  id: number;
  name: string;
  duration: number | null;
  price: number;
  category: string;
}

// Получаем случайную дату за последние 3 месяца
function getRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const randomTimestamp =
    threeMonthsAgo.getTime() +
    Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTimestamp);
}

async function main() {
  console.log("🌱 Генерируем работы...");

  // Получаем всех парикмахеров, клиентов и услуги
  const barbers = await prisma.barber.findMany({
    include: { person: true },
  });

  const clients = await prisma.client.findMany({
    include: { person: true },
  });

  const services = (await prisma.service.findMany()) as Service[];

  if (barbers.length === 0 || clients.length === 0 || services.length === 0) {
    console.log(
      "⚠️ Недостаточно данных. Сначала запусти seed: barbers, clients, services"
    );
    return;
  }

  console.log(`📊 Исходные данные:`);
  console.log(`   Парикмахеров: ${barbers.length}`);
  console.log(`   Клиентов: ${clients.length}`);
  console.log(`   Услуг: ${services.length}`);

  // Группируем услуги по категориям
  const servicesByCategory: Record<string, Service[]> = {};
  for (const service of services) {
    const category = service.category;
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(service);
  }

  // Для каждого парикмахера получаем доступные категории
  const barberAvailableServices: Record<number, Service[]> = {};
  for (const barber of barbers) {
    const specialization = barber.specialization || "Мужские стрижки";
    const allowedCategories = specializationToCategory[specialization] || [
      specialization,
    ];

    const availableServices: Service[] = [];
    for (const category of allowedCategories) {
      if (servicesByCategory[category]) {
        availableServices.push(...servicesByCategory[category]);
      }
    }
    barberAvailableServices[barber.id] = availableServices;
  }

  // Создаем работы
  const worksToCreate = 500;
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < worksToCreate; i++) {
    // Выбираем случайного клиента
    const client = clients[Math.floor(Math.random() * clients.length)];

    // Выбираем случайного парикмахера, у которого есть доступные услуги
    const eligibleBarbers = barbers.filter(
      (b) => barberAvailableServices[b.id]?.length > 0
    );
    if (eligibleBarbers.length === 0) {
      skipped++;
      continue;
    }

    const barber =
      eligibleBarbers[Math.floor(Math.random() * eligibleBarbers.length)];

    // Выбираем случайную услугу из доступных для этого парикмахера
    const availableServices = barberAvailableServices[barber.id];
    if (!availableServices || availableServices.length === 0) {
      skipped++;
      continue;
    }

    const service =
      availableServices[Math.floor(Math.random() * availableServices.length)];

    // Случайная дата за последние 3 месяца
    const workDate = getRandomDate();

    // Создаем работу
    await prisma.work.create({
      data: {
        clientId: client.id,
        barberId: barber.id,
        serviceId: service.id,
        workDate: workDate,
      },
    });

    created++;

    if (created % 50 === 0) {
      console.log(`   Создано ${created} работ...`);
    }
  }

  console.log(`\n✅ Создано ${created} работ`);
  console.log(`⏭️ Пропущено ${skipped}`);

  // Обновляем firstVisit для клиентов (дата первой работы)
  console.log("\n🔄 Обновляем даты первого визита клиентов...");

  const allClients = await prisma.client.findMany({
    include: {
      works: {
        orderBy: { workDate: "asc" },
      },
    },
  });

  let updatedClients = 0;
  for (const client of allClients) {
    if (client.works.length > 0) {
      const firstWork = client.works[0];
      await prisma.client.update({
        where: { id: client.id },
        data: { firstVisit: firstWork.workDate },
      });
      updatedClients++;
    }
  }

  console.log(
    `✅ Обновлено ${updatedClients} клиентов (установлена дата первого визита)`
  );

  // Статистика (без сортировки, просто выводим)
  console.log("\n📊 Статистика работ:");
  const workCount = await prisma.work.count();
  console.log(`   Всего работ: ${workCount}`);

  const barberStats = await prisma.work.groupBy({
    by: ["barberId"],
    _count: true,
  });

  console.log(`\n   Количество работ по парикмахерам:`);
  for (const stat of barberStats) {
    const barber = barbers.find((b) => b.id === stat.barberId);
    console.log(
      `   ${barber?.person.lastName} ${barber?.person.firstName}: ${stat._count} работ`
    );
  }

  const serviceStats = await prisma.work.groupBy({
    by: ["serviceId"],
    _count: true,
  });

  console.log(`\n   Количество работ по услугам:`);
  for (const stat of serviceStats) {
    const service = services.find((s) => s.id === stat.serviceId);
    console.log(`   ${service?.name}: ${stat._count} раз`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
