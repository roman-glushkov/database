import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Варианты отзывов
const reviewTemplates = [
  // Только звезды (без текста)
  { rating: 5, text: null },
  { rating: 4, text: null },
  { rating: 3, text: null },
  { rating: 2, text: null },
  { rating: 1, text: null },

  // Звезды + описание (положительные)
  { rating: 5, text: "Отличная работа! Всё понравилось, приду ещё!" },
  { rating: 5, text: "Спасибо мастеру, очень доволен результатом!" },
  { rating: 5, text: "Лучший парикмахер в городе! Рекомендую всем!" },
  { rating: 5, text: "Всё супер, быстро и качественно!" },
  { rating: 5, text: "Очень понравилось, буду ходить только сюда!" },
  { rating: 4, text: "Хорошо, но немного дороговато" },
  { rating: 4, text: "В целом неплохо, но можно и побыстрее" },
  { rating: 4, text: "Хороший сервис, вежливый персонал" },
  { rating: 4, text: "Понравилось, но есть куда расти" },

  // Звезды + описание (нейтральные/отрицательные)
  { rating: 3, text: "Нормально, но не идеально" },
  { rating: 3, text: "Средненько, ожидал большего" },
  { rating: 3, text: "Неплохо, но цена завышена" },
  { rating: 2, text: "Не очень понравилось, в следующий раз пойду к другому" },
  { rating: 2, text: "Долго ждал, результат не впечатлил" },
  { rating: 1, text: "Ужасно, не рекомендую!" },
  { rating: 1, text: "Испортили волосы, очень расстроен" },
];

// Функция для получения случайного отзыва
const getRandomReview = () => {
  const rand = Math.random();

  // 40% - без отзыва
  if (rand < 0.4) {
    return null;
  }

  // 30% - только звезды
  if (rand < 0.7) {
    const review = reviewTemplates.find((r) => r.text === null);
    const rating = [5, 4, 3, 2, 1][Math.floor(Math.random() * 5)];
    return { rating, text: null };
  }

  // 30% - звезды + описание
  const templatesWithText = reviewTemplates.filter((r) => r.text !== null);
  return templatesWithText[
    Math.floor(Math.random() * templatesWithText.length)
  ];
};

// Функция для генерации случайной даты отзыва (от даты работы до текущей)
const getRandomReviewDate = (workDate: Date): Date => {
  const now = new Date();
  const workTime = workDate.getTime();
  const nowTime = now.getTime();
  const reviewTime = workTime + Math.random() * (nowTime - workTime);
  return new Date(reviewTime);
};

async function main() {
  console.log("🚀 Начинаем добавление отзывов к выполненным работам...\n");

  // Получаем все работы
  const works = await prisma.work.findMany({
    include: {
      review: true,
      client: { include: { person: true } },
      barber: { include: { person: true } },
      service: true,
    },
  });

  console.log(`📊 Найдено работ: ${works.length}`);

  let created = 0;
  let skipped = 0;

  for (const work of works) {
    // Проверяем, есть ли уже отзыв
    if (work.review) {
      skipped++;
      continue;
    }

    const review = getRandomReview();

    // Если отзыва нет - пропускаем
    if (!review) {
      continue;
    }

    const reviewDate = getRandomReviewDate(new Date(work.workDate));

    await prisma.review.create({
      data: {
        workId: work.id,
        rating: review.rating,
        text: review.text,
        reviewDate: reviewDate,
      },
    });

    created++;

    if (created % 20 === 0) {
      console.log(`   Добавлено ${created} отзывов...`);
    }
  }

  console.log(`\n✅ Результаты:`);
  console.log(`   - Добавлено отзывов: ${created}`);
  console.log(`   - Пропущено (уже есть отзывы): ${skipped}`);
  console.log(`   - Без отзывов: ${works.length - created - skipped}`);

  // Статистика по оценкам
  const reviews = await prisma.review.findMany();
  const ratingStats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let withText = 0;

  for (const review of reviews) {
    ratingStats[review.rating]++;
    if (review.text) withText++;
  }

  console.log(`\n📊 Статистика оценок:`);
  for (let i = 5; i >= 1; i--) {
    const count = ratingStats[i];
    const percent =
      reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    console.log(`   ${i} ★: ${count} (${percent}%)`);
  }
  console.log(
    `\n📝 Отзывов с текстом: ${withText} (${Math.round(
      (withText / reviews.length) * 100
    )}%)`
  );
  console.log(`⭐ Отзывов только с оценкой: ${reviews.length - withText}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
