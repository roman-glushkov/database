// prisma/appointment-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Вспомогательные функции
const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Категории и их соответствие специализациям (из constants.ts)
const categorySpecializations: Record<string, string[]> = {
  "Мужские стрижки": ["Мужские стрижки"],
  "Женские стрижки": ["Женские стрижки"],
  Окрашивание: ["Окрашивание"],
  Укладка: ["Укладка"],
  "Коррекция бровей": ["Коррекция бровей"],
  "Лечение волос": ["Лечение волос", "Уходовые процедуры"],
  "Уходовые процедуры": ["Уходовые процедуры", "Лечение волос"],
  "Наращивание волос": ["Наращивание волос"],
  "Химическая завивка": ["Химическая завивка"],
  "Вечерние прически": ["Вечерние прически", "Укладка"],
  "Свадебные прически": ["Свадебные прически", "Вечерние прически", "Укладка"],
};

// Женские категории (для проверки пола)
const femaleCategories = [
  "Женские стрижки",
  "Свадебные прически",
  "Вечерние прически",
];
const maleCategories = ["Мужские стрижки"];

// Функция для определения пола клиента по имени (упрощенно)
const getClientGender = (firstName: string): "male" | "female" => {
  const femaleNames = [
    "Екатерина",
    "Ольга",
    "Наталья",
    "Анна",
    "Юлия",
    "Татьяна",
    "Елена",
    "Мария",
    "Ирина",
    "Ксения",
    "Анастасия",
    "Виктория",
    "Дарья",
    "Полина",
    "Александра",
    "Валентина",
    "Людмила",
    "Светлана",
    "Вера",
    "Надежда",
    "Алина",
    "Карина",
    "Диана",
    "София",
    "Алиса",
    "Маргарита",
    "Антонина",
    "Галина",
    "Нина",
    "Лариса",
  ];
  return femaleNames.includes(firstName) ? "female" : "male";
};

// Функция для проверки, может ли парикмахер выполнить услугу
const canBarberPerformService = (
  barberSpecialization: string | null,
  serviceCategory: string
): boolean => {
  if (!barberSpecialization) return false;
  const allowedSpecializations = categorySpecializations[serviceCategory];
  return allowedSpecializations
    ? allowedSpecializations.includes(barberSpecialization)
    : false;
};

// Функция для проверки, подходит ли услуга клиенту по полу
const isServiceAppropriateForClient = (
  serviceCategory: string,
  clientGender: "male" | "female"
): boolean => {
  if (clientGender === "male" && femaleCategories.includes(serviceCategory))
    return false;
  if (clientGender === "female" && maleCategories.includes(serviceCategory))
    return false;
  return true;
};

// Функция для проверки, работает ли парикмахер в выбранный день
const isBarberWorkingOnDay = (schedule: any, dayOfWeek: number): boolean => {
  const daySchedule = schedule.find((s: any) => s.dayOfWeek === dayOfWeek);
  return (
    daySchedule &&
    !daySchedule.isDayOff &&
    daySchedule.startTime &&
    daySchedule.endTime
  );
};

// Функция для получения времени работы парикмахера
const getBarberWorkTime = (
  schedule: any[],
  dayOfWeek: number
): { start: string; end: string } | null => {
  const daySchedule = schedule.find((s: any) => s.dayOfWeek === dayOfWeek);
  if (
    !daySchedule ||
    daySchedule.isDayOff ||
    !daySchedule.startTime ||
    !daySchedule.endTime
  )
    return null;
  return { start: daySchedule.startTime, end: daySchedule.endTime };
};

// Функция для генерации случайного времени в рабочем интервале
const generateRandomTime = (
  startTime: string,
  endTime: string,
  duration: number,
  existingAppointments: any[],
  date: Date
): string | null => {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const durationMinutes = duration;

  const possibleSlots: number[] = [];

  // Генерируем возможные слоты с интервалом 30 минут
  for (
    let time = startMinutes;
    time + durationMinutes <= endMinutes;
    time += 30
  ) {
    possibleSlots.push(time);
  }

  // Перемешиваем и проверяем на конфликты
  for (let i = possibleSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possibleSlots[i], possibleSlots[j]] = [possibleSlots[j], possibleSlots[i]];
  }

  for (const slot of possibleSlots) {
    const slotHour = Math.floor(slot / 60);
    const slotMin = slot % 60;
    const slotEnd = slot + durationMinutes;
    const slotEndHour = Math.floor(slotEnd / 60);
    const slotEndMin = slotEnd % 60;

    // Проверяем конфликты с существующими записями
    let hasConflict = false;
    for (const app of existingAppointments) {
      const appDate = new Date(app.date);
      const appHour = appDate.getHours();
      const appMin = appDate.getMinutes();
      const appDuration = app.service?.duration || 60;
      const appEndHour = appHour + Math.floor((appMin + appDuration) / 60);
      const appEndMin = (appMin + appDuration) % 60;

      if (
        (slotHour < appEndHour ||
          (slotHour === appEndHour && slotMin < appEndMin)) &&
        (slotEndHour > appHour ||
          (slotEndHour === appHour && slotEndMin > appMin))
      ) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      return `${slotHour.toString().padStart(2, "0")}:${slotMin
        .toString()
        .padStart(2, "0")}`;
    }
  }

  return null;
};

// Генерация случайной даты в диапазоне
const generateRandomDate = (startDate: Date, endDate: Date): Date => {
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

// Основная функция
async function main() {
  console.log("🚀 Начинаем создание записей (Appointments)...\n");

  // Получаем все необходимые данные
  const barbers = await prisma.barber.findMany({
    include: { person: true, schedules: true },
  });

  const clients = await prisma.client.findMany({
    include: { person: true },
  });

  const services = await prisma.service.findMany();
  const existingAppointments = await prisma.appointment.findMany({
    include: { service: true },
  });

  console.log(
    `📊 Найдено: ${barbers.length} парикмахеров, ${clients.length} клиентов, ${services.length} услуг`
  );
  console.log(`📊 Существующих записей: ${existingAppointments.length}\n`);

  const newAppointments = [];
  const targetCount = 500;
  let attempts = 0;
  const maxAttempts = 5000;

  const startDate = new Date(2026, 0, 1); // 01.01.2026
  const endDate = new Date(2026, 7, 1); // 01.08.2026

  // Группируем существующие записи по парикмахерам и датам для быстрой проверки
  const existingByBarberAndDate: Record<string, any[]> = {};
  for (const app of existingAppointments) {
    const key = `${app.barberId}_${app.date.toISOString().split("T")[0]}`;
    if (!existingByBarberAndDate[key]) existingByBarberAndDate[key] = [];
    existingByBarberAndDate[key].push(app);
  }

  console.log("🔄 Генерация записей...");

  while (newAppointments.length < targetCount && attempts < maxAttempts) {
    attempts++;

    // 1. Выбираем случайного клиента
    const client = clients[Math.floor(Math.random() * clients.length)];
    const clientGender = getClientGender(client.person.firstName);

    // 2. Выбираем случайную услугу
    const service = services[Math.floor(Math.random() * services.length)];

    // Проверяем, подходит ли услуга клиенту по полу
    if (!isServiceAppropriateForClient(service.category || "", clientGender)) {
      continue;
    }

    // 3. Выбираем парикмахера, который может выполнить эту услугу
    const availableBarbers = barbers.filter((barber) =>
      canBarberPerformService(barber.specialization, service.category || "")
    );

    if (availableBarbers.length === 0) continue;

    const barber =
      availableBarbers[Math.floor(Math.random() * availableBarbers.length)];

    // 4. Генерируем случайную дату
    let date = generateRandomDate(startDate, endDate);
    let dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    let workTime = getBarberWorkTime(barber.schedules, dayOfWeek);

    // Если не работает в этот день, ищем ближайший рабочий день
    let attemptsForDay = 0;
    while (!workTime && attemptsForDay < 30) {
      date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      workTime = getBarberWorkTime(barber.schedules, dayOfWeek);
      attemptsForDay++;
    }

    if (!workTime) continue;

    // 5. Получаем существующие записи на этот день
    const dateKey = `${barber.id}_${date.toISOString().split("T")[0]}`;
    const dayAppointments = existingByBarberAndDate[dateKey] || [];

    // 6. Генерируем случайное время
    const time = generateRandomTime(
      workTime.start,
      workTime.end,
      service.duration || 60,
      dayAppointments,
      date
    );

    if (!time) continue;

    // 7. Создаем запись
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Случайный статус (80% confirmed, 15% completed, 5% cancelled)
    let status = "confirmed";
    const statusRand = Math.random();
    if (statusRand > 0.85) {
      status = "cancelled";
    } else if (statusRand > 0.7) {
      status = "completed";
    }

    newAppointments.push({
      clientId: client.id,
      barberId: barber.id,
      serviceId: service.id,
      date: appointmentDate,
      status,
    });

    // Добавляем в существующие для следующих итераций
    if (!existingByBarberAndDate[dateKey])
      existingByBarberAndDate[dateKey] = [];
    existingByBarberAndDate[dateKey].push({
      date: appointmentDate,
      service: { duration: service.duration },
    });

    if (newAppointments.length % 50 === 0) {
      console.log(`   Создано ${newAppointments.length} записей...`);
    }
  }

  console.log(
    `\n✅ Сгенерировано ${newAppointments.length} записей за ${attempts} попыток`
  );

  // Сохраняем записи в базу данных
  console.log("\n💾 Сохранение записей в базу данных...");

  let saved = 0;
  for (const appointment of newAppointments) {
    await prisma.appointment.create({
      data: appointment,
    });
    saved++;
    if (saved % 100 === 0) {
      console.log(`   Сохранено ${saved} записей...`);
    }
  }

  console.log(`\n🎉 Готово! Добавлено ${saved} записей.`);

  // Статистика
  const statusStats = newAppointments.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n📊 Статистика по статусам:");
  Object.entries(statusStats).forEach(([status, count]) => {
    console.log(
      `   ${status}: ${count} (${Math.round((count / saved) * 100)}%)`
    );
  });

  // Статистика по категориям
  const categoryStats = newAppointments.reduce((acc, app) => {
    const service = services.find((s) => s.id === app.serviceId);
    const category = service?.category || "Неизвестно";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n📈 Статистика по категориям услуг (топ 10):");
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([category, count]) => {
      console.log(
        `   ${category}: ${count} (${Math.round((count / saved) * 100)}%)`
      );
    });

  // Статистика по парикмахерам
  const barberStats = newAppointments.reduce((acc, app) => {
    const barber = barbers.find((b) => b.id === app.barberId);
    const name = barber
      ? `${barber.person.lastName} ${barber.person.firstName}`
      : "Неизвестно";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n💈 Топ 5 парикмахеров по количеству записей:");
  Object.entries(barberStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count]) => {
      console.log(`   ${name}: ${count} записей`);
    });
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
