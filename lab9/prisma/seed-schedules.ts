import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Дни недели
const days = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

// Типы графиков работы
const scheduleTypes = [
  // Стандартная 5-дневка (ПН-ПТ 9-18, СБ-ВС выходной)
  {
    name: "Стандартная",
    days: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 6, isDayOff: true },
      { dayOfWeek: 7, isDayOff: true },
    ],
  },
  // Сменами (2/2)
  {
    name: "Сменный 2/2",
    days: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "10:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 3, isDayOff: true },
      { dayOfWeek: 4, isDayOff: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 6, startTime: "10:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 7, isDayOff: true },
    ],
  },
  // Выходные ПН и ВТ
  {
    name: "Выходные ПН-ВТ",
    days: [
      { dayOfWeek: 1, isDayOff: true },
      { dayOfWeek: 2, isDayOff: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "19:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "10:00", endTime: "19:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "10:00", endTime: "19:00", isDayOff: false },
      { dayOfWeek: 6, startTime: "10:00", endTime: "17:00", isDayOff: false },
      { dayOfWeek: 7, startTime: "10:00", endTime: "17:00", isDayOff: false },
    ],
  },
  // Вечерние смены
  {
    name: "Вечерние",
    days: [
      { dayOfWeek: 1, startTime: "14:00", endTime: "22:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "14:00", endTime: "22:00", isDayOff: false },
      { dayOfWeek: 3, startTime: "14:00", endTime: "22:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "14:00", endTime: "22:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "14:00", endTime: "22:00", isDayOff: false },
      { dayOfWeek: 6, startTime: "12:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 7, isDayOff: true },
    ],
  },
  // Утренние смены
  {
    name: "Утренние",
    days: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isDayOff: false },
      { dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "08:00", endTime: "16:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isDayOff: false },
      { dayOfWeek: 6, isDayOff: true },
      { dayOfWeek: 7, isDayOff: true },
    ],
  },
  // Работа по выходным
  {
    name: "Выходные дни",
    days: [
      { dayOfWeek: 1, isDayOff: true },
      { dayOfWeek: 2, isDayOff: true },
      { dayOfWeek: 3, isDayOff: true },
      { dayOfWeek: 4, isDayOff: true },
      { dayOfWeek: 5, isDayOff: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 7, startTime: "10:00", endTime: "20:00", isDayOff: false },
    ],
  },
  // Полная занятость
  {
    name: "Полная",
    days: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 6, startTime: "09:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 7, startTime: "09:00", endTime: "18:00", isDayOff: false },
    ],
  },
];

async function main() {
  console.log("🌱 Добавляем расписание для парикмахеров...");

  // Получаем всех парикмахеров
  const barbers = await prisma.barber.findMany({
    include: { person: true },
  });

  if (barbers.length === 0) {
    console.log("⚠️ Парикмахеры не найдены. Сначала запусти seed-barbers.ts");
    return;
  }

  let totalSchedules = 0;

  for (let i = 0; i < barbers.length; i++) {
    const barber = barbers[i];
    // Выбираем тип расписания по индексу (циклически)
    const scheduleType = scheduleTypes[i % scheduleTypes.length];

    console.log(
      `  📅 ${barber.person.lastName} ${barber.person.firstName} - ${scheduleType.name}`
    );

    for (const day of scheduleType.days) {
      await prisma.schedule.create({
        data: {
          barberId: barber.id,
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime || null,
          endTime: day.endTime || null,
          isDayOff: day.isDayOff,
        },
      });
      totalSchedules++;
    }
  }

  console.log(
    `\n✅ Добавлено ${totalSchedules} записей расписания для ${barbers.length} парикмахеров!`
  );
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
