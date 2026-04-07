// prisma/barber-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Функция для парсинга сертификатов (как в timeSlots.ts)
function parseCertificatesToJSON(
  certificates: string | string[]
): string | null {
  if (!certificates) return null;

  if (Array.isArray(certificates)) {
    return JSON.stringify(certificates);
  }

  if (typeof certificates === "string") {
    if (!certificates.trim()) return null;
    try {
      // Пробуем распарсить как JSON
      JSON.parse(certificates);
      return certificates;
    } catch {
      // Если не JSON, возвращаем как массив с одним элементом
      return JSON.stringify([certificates]);
    }
  }

  return null;
}

// Специализации из constants.ts
const specializationOptions = [
  "Мужские стрижки",
  "Женские стрижки",
  "Окрашивание",
  "Укладка",
  "Коррекция бровей",
  "Лечение волос",
  "Уходовые процедуры",
  "Наращивание волос",
  "Химическая завивка",
  "Вечерние прически",
  "Свадебные прически",
];

// Данные 20 парикмахеров
const barbersData = [
  {
    firstName: "Александр",
    middleName: "Владимирович",
    lastName: "Кузнецов",
    birthDate: "1985-03-15",
    phone: "+7 (912) 345-67-89",
    email: "alexander.kuznetsov@barbershop.ru",
    experience: 12,
    specialization: "Мужские стрижки",
    certificates: [
      "Лучший барбер 2020",
      "Специалист по бородам",
      "Мастер года 2022",
    ],
  },
  {
    firstName: "Дмитрий",
    middleName: "Алексеевич",
    lastName: "Соколов",
    birthDate: "1990-07-22",
    phone: "+7 (913) 456-78-90",
    email: "dmitry.sokolov@barbershop.ru",
    experience: 8,
    specialization: "Мужские стрижки",
    certificates: ["Мастер-барбер 2018", "Топ стилист"],
  },
  {
    firstName: "Максим",
    middleName: "Игоревич",
    lastName: "Попов",
    birthDate: "1988-11-10",
    phone: "+7 (914) 567-89-01",
    email: "maxim.popov@barbershop.ru",
    experience: 10,
    specialization: "Женские стрижки",
    certificates: ["Топ-барбер региона 2021", "Стилист года"],
  },
  {
    firstName: "Артем",
    middleName: "Сергеевич",
    lastName: "Васильев",
    birthDate: "1992-05-18",
    phone: "+7 (915) 678-90-12",
    email: "artem.vasiliev@barbershop.ru",
    experience: 7,
    specialization: "Мужские стрижки",
    certificates: ["Эксперт по бородам 2019"],
  },
  {
    firstName: "Иван",
    middleName: "Петрович",
    lastName: "Петров",
    birthDate: "1983-09-30",
    phone: "+7 (916) 789-01-23",
    email: "ivan.petrov@barbershop.ru",
    experience: 15,
    specialization: "Окрашивание",
    certificates: [
      "Заслуженный барбер",
      "Преподаватель барберов",
      "Колорист высшей категории",
    ],
  },
  {
    firstName: "Андрей",
    middleName: "Николаевич",
    lastName: "Смирнов",
    birthDate: "1995-02-14",
    phone: "+7 (917) 890-12-34",
    email: "andrey.smirnov@barbershop.ru",
    experience: 5,
    specialization: "Укладка",
    certificates: ["Молодой талант 2022"],
  },
  {
    firstName: "Сергей",
    middleName: "Михайлович",
    lastName: "Михайлов",
    birthDate: "1987-08-25",
    phone: "+7 (918) 901-23-45",
    email: "sergey.mikhailov@barbershop.ru",
    experience: 11,
    specialization: "Мужские стрижки",
    certificates: ["Лучший детский барбер 2020"],
  },
  {
    firstName: "Константин",
    middleName: "Денисович",
    lastName: "Федоров",
    birthDate: "1991-12-03",
    phone: "+7 (919) 012-34-56",
    email: "konstantin.fedorov@barbershop.ru",
    experience: 9,
    specialization: "Уходовые процедуры",
    certificates: ["Арт-барбер 2019", "Специалист по уходу"],
  },
  {
    firstName: "Владимир",
    middleName: "Андреевич",
    lastName: "Морозов",
    birthDate: "1984-04-17",
    phone: "+7 (920) 123-45-67",
    email: "vladimir.morozov@barbershop.ru",
    experience: 14,
    specialization: "Мужские стрижки",
    certificates: ["Лучший барбер города 2015", "Мастер спорта по барберингу"],
  },
  {
    firstName: "Павел",
    middleName: "Евгеньевич",
    lastName: "Волков",
    birthDate: "1993-09-08",
    phone: "+7 (921) 234-56-78",
    email: "pavel.volkov@barbershop.ru",
    experience: 6,
    specialization: "Коррекция бровей",
    certificates: ["Бровист года 2021"],
  },
  {
    firstName: "Екатерина",
    middleName: "Александровна",
    lastName: "Зайцева",
    birthDate: "1989-06-25",
    phone: "+7 (922) 345-67-89",
    email: "ekaterina.zaytseva@barbershop.ru",
    experience: 9,
    specialization: "Женские стрижки",
    certificates: ["Топ-стилист 2020", "Мастер женских стрижек"],
  },
  {
    firstName: "Ольга",
    middleName: "Дмитриевна",
    lastName: "Соловьева",
    birthDate: "1994-11-12",
    phone: "+7 (923) 456-78-90",
    email: "olga.solovieva@barbershop.ru",
    experience: 4,
    specialization: "Окрашивание",
    certificates: ["Колорист-визажист"],
  },
  {
    firstName: "Наталья",
    middleName: "Игоревна",
    lastName: "Козлова",
    birthDate: "1986-02-28",
    phone: "+7 (924) 567-89-01",
    email: "natalia.kozlova@barbershop.ru",
    experience: 13,
    specialization: "Укладка",
    certificates: ["Стилист высшей категории", "Эксперт по укладкам"],
  },
  {
    firstName: "Анна",
    middleName: "Сергеевна",
    lastName: "Новикова",
    birthDate: "1991-07-19",
    phone: "+7 (925) 678-90-12",
    email: "anna.novikova@barbershop.ru",
    experience: 7,
    specialization: "Лечение волос",
    certificates: ["Трихолог-консультант", "Мастер восстановления волос"],
  },
  {
    firstName: "Юлия",
    middleName: "Владимировна",
    lastName: "Морозова",
    birthDate: "1996-10-03",
    phone: "+7 (926) 789-01-23",
    email: "yulia.morozova@barbershop.ru",
    experience: 3,
    specialization: "Наращивание волос",
    certificates: ["Сертифицированный мастер по наращиванию"],
  },
  {
    firstName: "Татьяна",
    middleName: "Андреевна",
    lastName: "Петрова",
    birthDate: "1988-12-14",
    phone: "+7 (927) 890-12-34",
    email: "tatiana.petrova@barbershop.ru",
    experience: 10,
    specialization: "Химическая завивка",
    certificates: ["Эксперт по химической завивке", "Мастер-класс по кудрям"],
  },
  {
    firstName: "Елена",
    middleName: "Михайловна",
    lastName: "Сидорова",
    birthDate: "1987-05-21",
    phone: "+7 (928) 901-23-45",
    email: "elena.sidorova@barbershop.ru",
    experience: 11,
    specialization: "Вечерние прически",
    certificates: ["Прически для особых случаев"],
  },
  {
    firstName: "Мария",
    middleName: "Алексеевна",
    lastName: "Васильева",
    birthDate: "1990-03-11",
    phone: "+7 (929) 012-34-56",
    email: "maria.vasilieva@barbershop.ru",
    experience: 8,
    specialization: "Свадебные прически",
    certificates: ["Лучший свадебный стилист 2022"],
  },
  {
    firstName: "Ирина",
    middleName: "Николаевна",
    lastName: "Федорова",
    birthDate: "1992-09-27",
    phone: "+7 (930) 123-45-67",
    email: "irina.fedorova@barbershop.ru",
    experience: 6,
    specialization: "Уходовые процедуры",
    certificates: ["SPA-специалист"],
  },
  {
    firstName: "Ксения",
    middleName: "Павловна",
    lastName: "Михайлова",
    birthDate: "1995-01-05",
    phone: "+7 (931) 234-56-78",
    email: "ksenia.mikhailova@barbershop.ru",
    experience: 4,
    specialization: "Коррекция бровей",
    certificates: ["Бровист-бьютиблогер", "Мастер микроблейдинга"],
  },
];

async function main() {
  console.log("Начинаем заполнение базы данных парикмахерами...");

  for (const barber of barbersData) {
    // Сначала создаем Person
    const person = await prisma.person.create({
      data: {
        firstName: barber.firstName,
        middleName: barber.middleName,
        lastName: barber.lastName,
        birthDate: new Date(barber.birthDate),
        phone: barber.phone,
        email: barber.email,
      },
    });

    // Затем создаем Barber, связанный с Person
    await prisma.barber.create({
      data: {
        personId: person.id,
        experience: barber.experience,
        specialization: barber.specialization,
        certificates: parseCertificatesToJSON(barber.certificates),
      },
    });

    console.log(
      `✅ Добавлен парикмахер: ${barber.lastName} ${barber.firstName} - ${barber.specialization}`
    );
  }

  console.log(`\n🎉 Готово! Добавлено ${barbersData.length} парикмахеров.`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при заполнении базы данных:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
