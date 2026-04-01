import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Список возможных сертификатов
const allCertificates = [
  "🏆 Лучший парикмахер года 2023",
  "🏆 Чемпион по мужским стрижкам 2024",
  "🎓 Сертификат колориста международного класса",
  "📜 Диплом академии TONI&GUY",
  "🌟 Мастер-стилист премиум-класса",
  "✂️ Эксперт по сложным окрашиваниям",
  "💇‍♂️ Специалист по мужским стрижкам 1-й категории",
  "💇‍♀️ Мастер женских стрижек высшей категории",
  "🎨 Художник-колорист 2024",
  "🔥 Топ-стилист города 2023",
  "📚 Сертификат по наращиванию волос",
  "✨ Эксперт по кератиновому выпрямлению",
  "💫 Мастер вечерних и свадебных причесок",
  "🌟 Лучший барбер 2024",
  "🎯 Специалист по уходовым процедурам",
  "💎 Мастер химической завивки",
  "🌸 Эксперт по коррекции бровей",
  "⭐ Тренер-стилист академии",
  "🏅 Победитель чемпионата по стрижкам 2024",
  "📖 Сертификат международного образца",
  "🎪 Участник фестиваля парикмахерского искусства",
  "💼 Мастер-класс от ведущих стилистов Европы",
  "🌟 Лучший специалист по окрашиванию 2024",
  "✂️ Мастер-универсал премиум-класса",
];

// Комбинации сертификатов для разных парикмахеров
const certificatesCombinations = [
  null, // нет сертификатов
  null, // нет сертификатов
  [allCertificates[0]], // 1 сертификат
  [allCertificates[1], allCertificates[2]], // 2 сертификата
  [allCertificates[3], allCertificates[4], allCertificates[5]], // 3 сертификата
  [allCertificates[6], allCertificates[7]], // 2 сертификата
  null, // нет сертификатов
  [allCertificates[8], allCertificates[9], allCertificates[10], allCertificates[11]], // 4 сертификата
  [allCertificates[12]], // 1 сертификат
  [allCertificates[13], allCertificates[14]], // 2 сертификата
  null, // нет сертификатов
  [allCertificates[15], allCertificates[16], allCertificates[17]], // 3 сертификата
  [allCertificates[18], allCertificates[19]], // 2 сертификата
  [allCertificates[20]], // 1 сертификат
  null, // нет сертификатов
  [allCertificates[21], allCertificates[22], allCertificates[23]], // 3 сертификата
  [allCertificates[0], allCertificates[3], allCertificates[6], allCertificates[9]], // 4 сертификата
  [allCertificates[1], allCertificates[4], allCertificates[7]], // 3 сертификата
  null, // нет сертификатов
  [allCertificates[2], allCertificates[5], allCertificates[8], allCertificates[11], allCertificates[14]], // 5 сертификатов
  [allCertificates[10], allCertificates[12]], // 2 сертификата
  [allCertificates[13]], // 1 сертификат
  null, // нет сертификатов
  [allCertificates[15], allCertificates[16], allCertificates[17], allCertificates[18]], // 4 сертификата
];

async function main() {
  console.log('🌱 Добавляем сертификаты парикмахерам...');

  // Получаем всех парикмахеров с их данными person
  const barbers = await prisma.barber.findMany({
    include: {
      person: true
    },
    orderBy: { id: 'asc' }
  });

  if (barbers.length === 0) {
    console.log('⚠️ Парикмахеры не найдены. Сначала запусти seed-barbers.ts');
    return;
  }

  let updatedCount = 0;
  let withCertificates = 0;
  let withoutCertificates = 0;

  for (let i = 0; i < barbers.length && i < certificatesCombinations.length; i++) {
    const barber = barbers[i];
    const certificates = certificatesCombinations[i];
    
    if (certificates) {
      await prisma.barber.update({
        where: { id: barber.id },
        data: { certificates: JSON.stringify(certificates) }
      });
      console.log(`  ✅ ${barber.person.lastName} ${barber.person.firstName} - ${certificates.length} сертификатов`);
      withCertificates++;
    } else {
      await prisma.barber.update({
        where: { id: barber.id },
        data: { certificates: null }
      });
      console.log(`  ⭕ ${barber.person.lastName} ${barber.person.firstName} - нет сертификатов`);
      withoutCertificates++;
    }
    updatedCount++;
  }

  console.log(`\n✅ Обновлено ${updatedCount} парикмахеров:`);
  console.log(`   - С сертификатами: ${withCertificates}`);
  console.log(`   - Без сертификатов: ${withoutCertificates}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());