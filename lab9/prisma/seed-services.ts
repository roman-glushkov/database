import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Мужские стрижки",
  "Женские стрижки",
  "Окрашивание",
  "Укладка",
  "Стрижка + укладка",
  "Коррекция бровей",
  "Лечение волос",
  "Уходовые процедуры",
  "Наращивание волос",
  "Химическая завивка",
  "Вечерние прически",
  "Свадебные прически",
];

const servicesData = [
  // Мужские стрижки
  {
    name: "Стрижка полубокс",
    duration: 20,
    price: 550,
    category: "Мужские стрижки",
  },
  {
    name: "Стрижка бокс",
    duration: 20,
    price: 550,
    category: "Мужские стрижки",
  },
  {
    name: "Стрижка канадка",
    duration: 25,
    price: 650,
    category: "Мужские стрижки",
  },
  {
    name: "Стрижка андеркат",
    duration: 30,
    price: 700,
    category: "Мужские стрижки",
  },
  {
    name: "Оформление бороды и усов",
    duration: 15,
    price: 350,
    category: "Мужские стрижки",
  },

  // Женские стрижки
  {
    name: "Стрижка каскад",
    duration: 30,
    price: 800,
    category: "Женские стрижки",
  },
  {
    name: "Стрижка каре",
    duration: 25,
    price: 700,
    category: "Женские стрижки",
  },
  {
    name: "Стрижка боб",
    duration: 30,
    price: 800,
    category: "Женские стрижки",
  },
  {
    name: "Стрижка пикси",
    duration: 25,
    price: 700,
    category: "Женские стрижки",
  },
  {
    name: "Асимметричная стрижка",
    duration: 35,
    price: 900,
    category: "Женские стрижки",
  },

  // Окрашивание
  {
    name: "Классическое окрашивание",
    duration: 90,
    price: 2500,
    category: "Окрашивание",
  },
  {
    name: "Тонирование волос",
    duration: 60,
    price: 1800,
    category: "Окрашивание",
  },
  { name: "Мелирование", duration: 90, price: 2200, category: "Окрашивание" },
  {
    name: "Колорирование",
    duration: 120,
    price: 3000,
    category: "Окрашивание",
  },
  { name: "Омбре", duration: 90, price: 2500, category: "Окрашивание" },

  // Укладка
  {
    name: "Повседневная укладка",
    duration: 20,
    price: 500,
    category: "Укладка",
  },
  { name: "Укладка феном", duration: 15, price: 400, category: "Укладка" },
  { name: "Выпрямление волос", duration: 30, price: 600, category: "Укладка" },
  { name: "Локоны", duration: 30, price: 700, category: "Укладка" },

  // Стрижка + укладка
  {
    name: "Стрижка + укладка (короткие)",
    duration: 45,
    price: 1000,
    category: "Стрижка + укладка",
  },
  {
    name: "Стрижка + укладка (средние)",
    duration: 60,
    price: 1300,
    category: "Стрижка + укладка",
  },
  {
    name: "Стрижка + укладка (длинные)",
    duration: 75,
    price: 1600,
    category: "Стрижка + укладка",
  },

  // Коррекция бровей
  {
    name: "Коррекция бровей (воск)",
    duration: 15,
    price: 300,
    category: "Коррекция бровей",
  },
  {
    name: "Коррекция бровей (нити)",
    duration: 20,
    price: 350,
    category: "Коррекция бровей",
  },
  {
    name: "Окрашивание бровей",
    duration: 20,
    price: 400,
    category: "Коррекция бровей",
  },
  {
    name: "Ламинирование бровей",
    duration: 40,
    price: 800,
    category: "Коррекция бровей",
  },

  // Лечение волос
  {
    name: "Ампульное лечение",
    duration: 45,
    price: 1500,
    category: "Лечение волос",
  },
  { name: "Мезотерапия", duration: 40, price: 2000, category: "Лечение волос" },
  {
    name: "Стрижка горячими ножницами",
    duration: 30,
    price: 800,
    category: "Лечение волос",
  },
  {
    name: "Массаж головы",
    duration: 20,
    price: 600,
    category: "Лечение волос",
  },

  // Уходовые процедуры
  {
    name: "Ламинирование волос",
    duration: 60,
    price: 1800,
    category: "Уходовые процедуры",
  },
  {
    name: "Кератиновое выпрямление",
    duration: 90,
    price: 3000,
    category: "Уходовые процедуры",
  },
  {
    name: "Ботокс для волос",
    duration: 60,
    price: 2200,
    category: "Уходовые процедуры",
  },
  {
    name: "SPA-уход для волос",
    duration: 60,
    price: 2000,
    category: "Уходовые процедуры",
  },

  // Наращивание волос
  {
    name: "Капсульное наращивание",
    duration: 180,
    price: 8000,
    category: "Наращивание волос",
  },
  {
    name: "Ленточное наращивание",
    duration: 90,
    price: 5000,
    category: "Наращивание волос",
  },
  {
    name: "Ультразвуковое наращивание",
    duration: 120,
    price: 7000,
    category: "Наращивание волос",
  },
  {
    name: "Коррекция наращивания",
    duration: 60,
    price: 3000,
    category: "Наращивание волос",
  },

  // Химическая завивка
  {
    name: "Химическая завивка (короткие)",
    duration: 90,
    price: 2500,
    category: "Химическая завивка",
  },
  {
    name: "Химическая завивка (средние)",
    duration: 120,
    price: 3000,
    category: "Химическая завивка",
  },
  {
    name: "Химическая завивка (длинные)",
    duration: 150,
    price: 3500,
    category: "Химическая завивка",
  },
  {
    name: "Биозавивка",
    duration: 90,
    price: 2800,
    category: "Химическая завивка",
  },

  // Вечерние прически
  {
    name: "Вечерняя укладка",
    duration: 40,
    price: 1200,
    category: "Вечерние прически",
  },
  {
    name: "Вечерний пучок",
    duration: 35,
    price: 1000,
    category: "Вечерние прически",
  },
  {
    name: "Греческая прическа",
    duration: 45,
    price: 1300,
    category: "Вечерние прически",
  },
  {
    name: "Ретро-волны",
    duration: 50,
    price: 1500,
    category: "Вечерние прически",
  },

  // Свадебные прически
  {
    name: "Свадебная прическа (сложная)",
    duration: 90,
    price: 2500,
    category: "Свадебные прически",
  },
  {
    name: "Свадебная прическа с плетением",
    duration: 80,
    price: 2200,
    category: "Свадебные прически",
  },
  {
    name: "Свадебная прическа с цветами",
    duration: 70,
    price: 2000,
    category: "Свадебные прически",
  },
  {
    name: "Свадебный локон",
    duration: 50,
    price: 1500,
    category: "Свадебные прически",
  },
];

async function main() {
  console.log("🌱 Добавляем услуги...");

  let created = 0;
  let skipped = 0;

  for (const service of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (existing) {
      console.log(`  ⏭️ Пропущена: ${service.name}`);
      skipped++;
      continue;
    }

    await prisma.service.create({
      data: {
        name: service.name,
        duration: service.duration,
        price: service.price,
        category: service.category,
      },
    });

    console.log(
      `  ✅ ${service.name} - ${service.duration} мин, ${service.price} ₽ (${service.category})`
    );
    created++;
  }

  console.log(`\n✅ Добавлено ${created} услуг`);
  console.log(`⏭️ Пропущено ${skipped} (уже существуют)`);

  // Проверяем, что у каждой категории есть услуги
  console.log("\n📊 Проверка категорий:");
  for (const category of categories) {
    const count = await prisma.service.count({
      where: { category },
    });
    console.log(`   ${category}: ${count} услуг`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
