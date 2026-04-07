// prisma/service-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Тип для услуги
interface ServiceData {
  name: string;
  category: string;
  duration: number;
  price: number;
}

// Услуги по категориям
const servicesData: ServiceData[] = [
  // ========== Мужские стрижки ==========
  {
    name: "Полубокс",
    category: "Мужские стрижки",
    duration: 30,
    price: 800,
  },
  {
    name: "Бокс",
    category: "Мужские стрижки",
    duration: 25,
    price: 700,
  },
  {
    name: "Канадка",
    category: "Мужские стрижки",
    duration: 40,
    price: 1000,
  },
  {
    name: "Андеркат",
    category: "Мужские стрижки",
    duration: 45,
    price: 1200,
  },
  {
    name: "Оформление бороды и усов",
    category: "Мужские стрижки",
    duration: 30,
    price: 600,
  },

  // ========== Женские стрижки ==========
  {
    name: "Каскад",
    category: "Женские стрижки",
    duration: 50,
    price: 1500,
  },
  {
    name: "Каре",
    category: "Женские стрижки",
    duration: 40,
    price: 1300,
  },
  {
    name: "Боб",
    category: "Женские стрижки",
    duration: 45,
    price: 1400,
  },
  {
    name: "Пикси",
    category: "Женские стрижки",
    duration: 35,
    price: 1200,
  },
  {
    name: "Ассиметричная стрижка",
    category: "Женские стрижки",
    duration: 55,
    price: 1700,
  },

  // ========== Окрашивание ==========
  {
    name: "Классическое перманентное окрашивание",
    category: "Окрашивание",
    duration: 90,
    price: 2500,
  },
  {
    name: "Тонирование волос",
    category: "Окрашивание",
    duration: 60,
    price: 1800,
  },
  {
    name: "Мелирование",
    category: "Окрашивание",
    duration: 120,
    price: 3500,
  },
  {
    name: "Колорирование",
    category: "Окрашивание",
    duration: 150,
    price: 4500,
  },
  {
    name: "Брондирование",
    category: "Окрашивание",
    duration: 130,
    price: 4000,
  },
  {
    name: "Омбре",
    category: "Окрашивание",
    duration: 120,
    price: 3800,
  },
  {
    name: "Air Touch",
    category: "Окрашивание",
    duration: 140,
    price: 5000,
  },
  {
    name: "Декапирование",
    category: "Окрашивание",
    duration: 60,
    price: 2000,
  },
  {
    name: "Элюминирование",
    category: "Окрашивание",
    duration: 80,
    price: 2800,
  },

  // ========== Укладка ==========
  {
    name: "Повседневная укладка",
    category: "Укладка",
    duration: 30,
    price: 800,
  },
  {
    name: "Вечерняя укладка",
    category: "Укладка",
    duration: 60,
    price: 1800,
  },

  // ========== Коррекция бровей ==========
  {
    name: "Коррекция формы бровей пинцетом",
    category: "Коррекция бровей",
    duration: 20,
    price: 500,
  },
  {
    name: "Окрашивание бровей",
    category: "Коррекция бровей",
    duration: 30,
    price: 700,
  },
  {
    name: "Ламинирование бровей",
    category: "Коррекция бровей",
    duration: 45,
    price: 1500,
  },

  // ========== Лечение волос ==========
  {
    name: "Ампульное лечение",
    category: "Лечение волос",
    duration: 60,
    price: 2500,
  },
  {
    name: "Озонотерапия",
    category: "Лечение волос",
    duration: 45,
    price: 3000,
  },
  {
    name: "Мезотерапия",
    category: "Лечение волос",
    duration: 50,
    price: 3500,
  },
  {
    name: "Стрижка горячими ножницами",
    category: "Лечение волос",
    duration: 60,
    price: 2000,
  },

  // ========== Уходовые процедуры ==========
  {
    name: "Массаж головы",
    category: "Уходовые процедуры",
    duration: 20,
    price: 600,
  },
  {
    name: "Ламинирование волос",
    category: "Уходовые процедуры",
    duration: 90,
    price: 3500,
  },
  {
    name: "Кератиновое выпрямление волос",
    category: "Уходовые процедуры",
    duration: 120,
    price: 5000,
  },
  {
    name: "Элюминирование",
    category: "Уходовые процедуры",
    duration: 80,
    price: 2800,
  },

  // ========== Наращивание волос ==========
  {
    name: "Капсульное наращивание",
    category: "Наращивание волос",
    duration: 180,
    price: 8000,
  },
  {
    name: "Ленточное наращивание",
    category: "Наращивание волос",
    duration: 120,
    price: 6000,
  },
  {
    name: "Ультразвуковое наращивание",
    category: "Наращивание волос",
    duration: 150,
    price: 7500,
  },

  // ========== Химическая завивка ==========
  {
    name: "Химическая завивка",
    category: "Химическая завивка",
    duration: 120,
    price: 3500,
  },

  // ========== Вечерние прически ==========
  {
    name: "Вечерняя укладка",
    category: "Вечерние прически",
    duration: 60,
    price: 2000,
  },
  {
    name: "Фигурная прическа с использованием дополнительных материалов",
    category: "Вечерние прически",
    duration: 90,
    price: 3500,
  },

  // ========== Свадебные прически ==========
  {
    name: "Свадебные прически",
    category: "Свадебные прически",
    duration: 120,
    price: 5000,
  },
];

async function main() {
  console.log("Начинаем добавление услуг...\n");

  let created = 0;
  let skipped = 0;

  for (const service of servicesData) {
    // Проверяем, существует ли уже такая услуга
    const existing = await prisma.service.findFirst({
      where: {
        name: service.name,
        category: service.category,
      },
    });

    if (existing) {
      console.log(
        `⏭️ Пропущено: ${service.name} (${service.category}) - уже существует`
      );
      skipped++;
      continue;
    }

    // Создаем новую услугу
    await prisma.service.create({
      data: {
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: service.price,
      },
    });

    console.log(
      `✅ Добавлено: ${service.name} (${service.category}) - ${service.duration} мин, ${service.price} ₽`
    );
    created++;
  }

  console.log(`\n🎉 Готово! Добавлено: ${created}, Пропущено: ${skipped}`);
  console.log(`📊 Всего услуг в базе: ${servicesData.length}`);

  // Вывод статистики по категориям
  const stats = servicesData.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n📈 Статистика по категориям:");
  Object.entries(stats).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} услуг`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при добавлении услуг:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
