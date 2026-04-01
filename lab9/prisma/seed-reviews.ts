import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Массив отзывов (хорошие, средние, плохие)
const reviewsData = [
  // Отличные отзывы (5 звезд)
  {
    rating: 5,
    text: "Отличный мастер! Всё сделал профессионально и быстро. Обязательно приду еще!",
  },
  {
    rating: 5,
    text: "Очень довольна результатом! Волосы выглядят шикарно. Спасибо мастеру!",
  },
  {
    rating: 5,
    text: "Лучший парикмахер в городе! Всегда доволен результатом. Рекомендую!",
  },
  {
    rating: 5,
    text: "Великолепно! Полностью оправдал ожидания. Буду рекомендовать друзьям!",
  },
  {
    rating: 5,
    text: "Профессионал своего дела. Очень внимательный и аккуратный. Спасибо!",
  },
  {
    rating: 5,
    text: "Прекрасный салон, уютная атмосфера, мастер - золотые руки!",
  },
  {
    rating: 5,
    text: "Осталась в полном восторге! Стрижка супер, укладка держится отлично!",
  },
  {
    rating: 5,
    text: "Мастер учел все пожелания, результат превзошел ожидания. 10/10!",
  },
  {
    rating: 5,
    text: "Очень понравилось отношение к клиенту, все объяснили, посоветовали. Спасибо!",
  },
  { rating: 5, text: "Стрижка 🔥🔥🔥. Теперь только сюда!" },

  // Хорошие отзывы (4 звезды)
  {
    rating: 4,
    text: "Хороший мастер, но немного долго. В целом довольна результатом.",
  },
  {
    rating: 4,
    text: "Всё понравилось, но цена немного завышена. Хороший сервис.",
  },
  {
    rating: 4,
    text: "Стрижка хорошая, но хотелось бы чуть быстрее. Рекомендую мастера!",
  },
  {
    rating: 4,
    text: "Неплохо, но есть куда расти. В целом всё хорошо, спасибо!",
  },
  {
    rating: 4,
    text: "Довольна результатом, но пришлось немного подождать. В остальном всё отлично!",
  },
  { rating: 4, text: "Хороший сервис, вежливый персонал. Стрижка аккуратная." },
  { rating: 4, text: "В целом всё понравилось, буду приходить еще!" },

  // Средние отзывы (3 звезды)
  { rating: 3, text: "Нормально, но не идеально. Могло быть и лучше." },
  { rating: 3, text: "Средненько. Ожидала большего от такого мастера." },
  { rating: 3, text: "Неплохо, но не то что хотелось. Возможно приду еще." },
  {
    rating: 3,
    text: "Так себе. Не совсем то что просила, но исправлять не стала.",
  },
  { rating: 3, text: "Обычная стрижка, ничего особенного. Цена завышена." },

  // Плохие отзывы (2 звезды)
  { rating: 2, text: "Не очень понравилось. Стрижка не такая как хотелось." },
  { rating: 2, text: "Долго ждал, сделали неаккуратно. Разочарован." },
  { rating: 2, text: "Не оправдал ожиданий. Результат так себе." },

  // Очень плохие отзывы (1 звезда)
  { rating: 1, text: "Ужасно! Испортили волосы. Больше не приду!" },
  { rating: 1, text: "Катастрофа! Никому не рекомендую. Деньги на ветер." },
];

// Получаем случайный отзыв
function getRandomReview() {
  return reviewsData[Math.floor(Math.random() * reviewsData.length)];
}

// Получаем случайную дату в пределах 14 дней после работы
function getRandomReviewDate(workDate: Date) {
  const maxDays = 14;
  const randomDays = Math.floor(Math.random() * maxDays);
  const reviewDate = new Date(workDate);
  reviewDate.setDate(workDate.getDate() + randomDays);
  return reviewDate;
}

async function main() {
  console.log("🌱 Генерируем отзывы...");

  // Получаем все работы, у которых нет отзывов
  const worksWithoutReview = await prisma.work.findMany({
    where: {
      review: null,
    },
    include: {
      client: { include: { person: true } },
      barber: { include: { person: true } },
      service: true,
    },
  });

  console.log(`📊 Найдено работ без отзывов: ${worksWithoutReview.length}`);

  // Создаем отзывы примерно на 70-80% работ
  const targetReviews = Math.floor(worksWithoutReview.length * 0.75);
  console.log(`🎯 Планируем создать отзывов: ${targetReviews}`);

  let created = 0;
  let skipped = 0;

  // Перемешиваем работы случайным образом
  const shuffledWorks = [...worksWithoutReview];
  for (let i = shuffledWorks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWorks[i], shuffledWorks[j]] = [shuffledWorks[j], shuffledWorks[i]];
  }

  // Берем первые targetReviews работ
  const worksToReview = shuffledWorks.slice(0, targetReviews);

  for (const work of worksToReview) {
    const review = getRandomReview();
    const reviewDate = getRandomReviewDate(work.workDate);

    await prisma.review.create({
      data: {
        workId: work.id,
        rating: review.rating,
        text: review.text,
        reviewDate: reviewDate,
      },
    });

    created++;

    if (created % 50 === 0) {
      console.log(`   Создано ${created} отзывов...`);
    }
  }

  console.log(`\n✅ Создано ${created} отзывов`);
  console.log(
    `⏭️ Без отзывов осталось: ${worksWithoutReview.length - created}`
  );

  // Статистика по оценкам
  console.log("\n📊 Статистика оценок:");
  const ratingStats = await prisma.review.groupBy({
    by: ["rating"],
    _count: true,
  });

  const ratingMap: Record<number, number> = {};
  for (const stat of ratingStats) {
    ratingMap[stat.rating] = stat._count;
  }

  for (let i = 1; i <= 5; i++) {
    const count = ratingMap[i] || 0;
    const percent = Math.round((count / created) * 100);
    console.log(`   ${i} ★: ${count} отзывов (${percent}%)`);
  }

  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
  });
  console.log(`\n📈 Средняя оценка: ${avgRating._avg.rating?.toFixed(2)} ★`);

  // Топ парикмахеров по отзывам
  console.log("\n🏆 Топ парикмахеров по количеству отзывов:");
  const barberReviews = await prisma.review.groupBy({
    by: ["workId"],
    _count: true,
  });

  // Получаем работы с отзывами
  const reviewsWithWorks = await prisma.review.findMany({
    include: {
      work: {
        include: {
          barber: { include: { person: true } },
        },
      },
    },
  });

  const barberReviewCount: Record<string, { count: number; name: string }> = {};
  for (const review of reviewsWithWorks) {
    const barber = review.work.barber;
    const key = `${barber.person.lastName} ${barber.person.firstName}`;
    if (!barberReviewCount[key]) {
      barberReviewCount[key] = { count: 0, name: key };
    }
    barberReviewCount[key].count++;
  }

  const sortedBarbers = Object.values(barberReviewCount).sort(
    (a, b) => b.count - a.count
  );
  for (let i = 0; i < Math.min(5, sortedBarbers.length); i++) {
    console.log(
      `   ${i + 1}. ${sortedBarbers[i].name} - ${
        sortedBarbers[i].count
      } отзывов`
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
