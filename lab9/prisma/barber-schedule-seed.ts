// prisma/barber-schedule-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Типы расписаний
type SchedulePattern = {
  [day: number]: { startTime: string; endTime: string } | null;
};

// Паттерны расписаний для разных категорий парикмахеров
const schedulePatterns = {
  // Стандартная 5-дневка (ПН-ПТ с 10 до 20, СБ-ВС выходные)
  standard5days: {
    1: { startTime: "10:00", endTime: "20:00" }, // ПН
    2: { startTime: "10:00", endTime: "20:00" }, // ВТ
    3: { startTime: "10:00", endTime: "20:00" }, // СР
    4: { startTime: "10:00", endTime: "20:00" }, // ЧТ
    5: { startTime: "10:00", endTime: "20:00" }, // ПТ
    6: null, // СБ - выходной
    7: null, // ВС - выходной
  },

  // Сменами 2/2 (рабочие дни в разнобой)
  shift2x2: {
    1: { startTime: "09:00", endTime: "21:00" }, // ПН
    2: { startTime: "09:00", endTime: "21:00" }, // ВТ
    3: null, // СР - выходной
    4: null, // ЧТ - выходной
    5: { startTime: "09:00", endTime: "21:00" }, // ПТ
    6: { startTime: "09:00", endTime: "21:00" }, // СБ
    7: null, // ВС - выходной
  },

  // Полная неделя (без выходных)
  fullWeek: {
    1: { startTime: "09:00", endTime: "21:00" }, // ПН
    2: { startTime: "09:00", endTime: "21:00" }, // ВТ
    3: { startTime: "09:00", endTime: "21:00" }, // СР
    4: { startTime: "09:00", endTime: "21:00" }, // ЧТ
    5: { startTime: "09:00", endTime: "21:00" }, // ПТ
    6: { startTime: "10:00", endTime: "18:00" }, // СБ
    7: { startTime: "10:00", endTime: "18:00" }, // ВС
  },

  // Укороченные дни + выходные
  shortDays: {
    1: { startTime: "12:00", endTime: "20:00" }, // ПН
    2: { startTime: "12:00", endTime: "20:00" }, // ВТ
    3: { startTime: "12:00", endTime: "20:00" }, // СР
    4: null, // ЧТ - выходной
    5: { startTime: "12:00", endTime: "20:00" }, // ПТ
    6: { startTime: "10:00", endTime: "16:00" }, // СБ
    7: null, // ВС - выходной
  },

  // Вечерние часы (для совмещающих с учебой/работой)
  eveningOnly: {
    1: { startTime: "15:00", endTime: "22:00" }, // ПН
    2: { startTime: "15:00", endTime: "22:00" }, // ВТ
    3: { startTime: "15:00", endTime: "22:00" }, // СР
    4: { startTime: "15:00", endTime: "22:00" }, // ЧТ
    5: { startTime: "15:00", endTime: "22:00" }, // ПТ
    6: { startTime: "12:00", endTime: "20:00" }, // СБ
    7: null, // ВС - выходной
  },

  // Утренние часы
  morningOnly: {
    1: { startTime: "08:00", endTime: "14:00" }, // ПН
    2: { startTime: "08:00", endTime: "14:00" }, // ВТ
    3: { startTime: "08:00", endTime: "14:00" }, // СР
    4: { startTime: "08:00", endTime: "14:00" }, // ЧТ
    5: { startTime: "08:00", endTime: "14:00" }, // ПТ
    6: null, // СБ - выходной
    7: null, // ВС - выходной
  },

  // Только выходные
  weekendsOnly: {
    1: null, // ПН
    2: null, // ВТ
    3: null, // СР
    4: null, // ЧТ
    5: null, // ПТ
    6: { startTime: "10:00", endTime: "20:00" }, // СБ
    7: { startTime: "10:00", endTime: "18:00" }, // ВС
  },

  // С расширенным рабочим днем
  extendedDay: {
    1: { startTime: "09:00", endTime: "22:00" }, // ПН
    2: { startTime: "09:00", endTime: "22:00" }, // ВТ
    3: { startTime: "09:00", endTime: "22:00" }, // СР
    4: { startTime: "09:00", endTime: "22:00" }, // ЧТ
    5: { startTime: "09:00", endTime: "22:00" }, // ПТ
    6: { startTime: "10:00", endTime: "20:00" }, // СБ
    7: null, // ВС - выходной
  },

  // Гибкий график (плавающие выходные)
  flexible: {
    1: { startTime: "10:00", endTime: "19:00" }, // ПН
    2: null, // ВТ - выходной
    3: { startTime: "10:00", endTime: "19:00" }, // СР
    4: null, // ЧТ - выходной
    5: { startTime: "10:00", endTime: "19:00" }, // ПТ
    6: { startTime: "11:00", endTime: "18:00" }, // СБ
    7: { startTime: "11:00", endTime: "17:00" }, // ВС
  },

  // Сокращенная пятница
  shortFriday: {
    1: { startTime: "10:00", endTime: "20:00" }, // ПН
    2: { startTime: "10:00", endTime: "20:00" }, // ВТ
    3: { startTime: "10:00", endTime: "20:00" }, // СР
    4: { startTime: "10:00", endTime: "20:00" }, // ЧТ
    5: { startTime: "10:00", endTime: "16:00" }, // ПТ (сокращенный)
    6: { startTime: "11:00", endTime: "18:00" }, // СБ
    7: null, // ВС - выходной
  },

  // Ночной график (для клубов/вечеринок)
  nightShift: {
    1: { startTime: "14:00", endTime: "23:00" }, // ПН
    2: { startTime: "14:00", endTime: "23:00" }, // ВТ
    3: null, // СР - выходной
    4: { startTime: "14:00", endTime: "23:00" }, // ЧТ
    5: { startTime: "14:00", endTime: "02:00" }, // ПТ (до 2х ночи)
    6: { startTime: "14:00", endTime: "02:00" }, // СБ
    7: { startTime: "14:00", endTime: "22:00" }, // ВС
  },
};

// Список парикмахеров с их расписаниями (по ID из Person)
// Порядок соответствует предыдущему seed-файлу
const barberSchedules = [
  { name: "Кузнецов Александр", pattern: schedulePatterns.standard5days },
  { name: "Соколов Дмитрий", pattern: schedulePatterns.fullWeek },
  { name: "Попов Максим", pattern: schedulePatterns.shift2x2 },
  { name: "Васильев Артем", pattern: schedulePatterns.extendedDay },
  { name: "Петров Иван", pattern: schedulePatterns.eveningOnly },
  { name: "Смирнов Андрей", pattern: schedulePatterns.morningOnly },
  { name: "Михайлов Сергей", pattern: schedulePatterns.shortDays },
  { name: "Федоров Константин", pattern: schedulePatterns.flexible },
  { name: "Морозов Владимир", pattern: schedulePatterns.weekendsOnly },
  { name: "Волков Павел", pattern: schedulePatterns.shortFriday },
  { name: "Зайцева Екатерина", pattern: schedulePatterns.standard5days },
  { name: "Соловьева Ольга", pattern: schedulePatterns.fullWeek },
  { name: "Козлова Наталья", pattern: schedulePatterns.eveningOnly },
  { name: "Новикова Анна", pattern: schedulePatterns.morningOnly },
  { name: "Морозова Юлия", pattern: schedulePatterns.shift2x2 },
  { name: "Петрова Татьяна", pattern: schedulePatterns.extendedDay },
  { name: "Сидорова Елена", pattern: schedulePatterns.flexible },
  { name: "Васильева Мария", pattern: schedulePatterns.shortDays },
  { name: "Федорова Ирина", pattern: schedulePatterns.weekendsOnly },
  { name: "Михайлова Ксения", pattern: schedulePatterns.nightShift },
];

async function main() {
  console.log("Начинаем добавление расписаний для парикмахеров...\n");

  // Получаем всех парикмахеров с их Person данными
  const barbers = await prisma.barber.findMany({
    include: {
      person: true,
    },
  });

  console.log(`Найдено ${barbers.length} парикмахеров\n`);

  let totalSchedules = 0;

  for (let i = 0; i < barbers.length && i < barberSchedules.length; i++) {
    const barber = barbers[i];
    const scheduleConfig = barberSchedules[i];

    if (!scheduleConfig) {
      console.log(
        `⚠️ Нет конфигурации для ${barber.person.lastName} ${barber.person.firstName}`
      );
      continue;
    }

    console.log(`📋 Добавление расписания для: ${scheduleConfig.name}`);

    let schedulesCount = 0;

    // Для каждого дня недели (1-7)
    for (let day = 1; day <= 7; day++) {
      const daySchedule =
        scheduleConfig.pattern[day as keyof typeof scheduleConfig.pattern];

      // Проверяем, существует ли уже расписание на этот день
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          barberId: barber.id,
          dayOfWeek: day,
        },
      });

      if (existingSchedule) {
        // Обновляем существующее
        if (daySchedule) {
          await prisma.schedule.update({
            where: { id: existingSchedule.id },
            data: {
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isDayOff: false,
            },
          });
          console.log(
            `  ✅ ${getDayName(day)}: ${daySchedule.startTime} - ${
              daySchedule.endTime
            } (обновлено)`
          );
          schedulesCount++;
        } else if (!existingSchedule.isDayOff) {
          // Делаем выходным
          await prisma.schedule.update({
            where: { id: existingSchedule.id },
            data: {
              startTime: null,
              endTime: null,
              isDayOff: true,
            },
          });
          console.log(`  📅 ${getDayName(day)}: Выходной (обновлено)`);
          schedulesCount++;
        }
      } else {
        // Создаем новое расписание
        if (daySchedule) {
          await prisma.schedule.create({
            data: {
              barberId: barber.id,
              dayOfWeek: day,
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isDayOff: false,
            },
          });
          console.log(
            `  ✅ ${getDayName(day)}: ${daySchedule.startTime} - ${
              daySchedule.endTime
            }`
          );
          schedulesCount++;
        } else {
          await prisma.schedule.create({
            data: {
              barberId: barber.id,
              dayOfWeek: day,
              startTime: null,
              endTime: null,
              isDayOff: true,
            },
          });
          console.log(`  📅 ${getDayName(day)}: Выходной`);
          schedulesCount++;
        }
      }
    }

    console.log(`  📊 Итого: ${schedulesCount} дней с расписанием\n`);
    totalSchedules += schedulesCount;
  }

  console.log(
    `🎉 Готово! Добавлено/обновлено расписаний для ${barbers.length} парикмахеров`
  );
  console.log(`📊 Всего записей расписания: ${totalSchedules}`);
}

function getDayName(day: number): string {
  const days: Record<number, string> = {
    1: "Понедельник",
    2: "Вторник",
    3: "Среда",
    4: "Четверг",
    5: "Пятница",
    6: "Суббота",
    7: "Воскресенье",
  };
  return days[day];
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при добавлении расписаний:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
