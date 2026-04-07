// prisma/client-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Функция для генерации случайного числа в диапазоне
const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Функция для генерации случайного телефона
const generatePhone = () => {
  const operators = [
    "912",
    "913",
    "914",
    "915",
    "916",
    "917",
    "918",
    "919",
    "920",
    "921",
    "922",
    "923",
    "924",
    "925",
    "926",
    "927",
    "928",
    "929",
    "930",
    "931",
  ];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const num1 = random(100, 999);
  const num2 = random(10, 99);
  const num3 = random(10, 99);
  return `+7 (${operator}) ${num1}-${num2}-${num3}`;
};

// Функция для генерации email
const generateEmail = (firstName: string, lastName: string, index: number) => {
  const domains = [
    "gmail.com",
    "yandex.ru",
    "mail.ru",
    "bk.ru",
    "list.ru",
    "inbox.ru",
    "rambler.ru",
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const variants = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${random(1, 999)}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}`,
    `client${index}`,
  ];
  const username = variants[Math.floor(Math.random() * variants.length)];
  return `${username}@${domain}`;
};

// Функция для генерации даты рождения (от 5 до 80 лет)
const generateBirthDate = () => {
  const today = new Date();
  const age = random(5, 80);
  const year = today.getFullYear() - age;
  const month = random(0, 11);
  const day = random(1, 28);
  return new Date(year, month, day);
};

// Функция для форматирования даты в ISO строку
const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

// Список имен
const firstNames = {
  male: [
    "Александр",
    "Дмитрий",
    "Максим",
    "Артем",
    "Иван",
    "Андрей",
    "Сергей",
    "Константин",
    "Владимир",
    "Павел",
    "Михаил",
    "Евгений",
    "Николай",
    "Алексей",
    "Олег",
    "Роман",
    "Василий",
    "Григорий",
    "Виктор",
    "Станислав",
    "Данил",
    "Тимофей",
    "Кирилл",
    "Вячеслав",
    "Илья",
    "Матвей",
    "Егор",
    "Федор",
    "Борис",
    "Семен",
  ],
  female: [
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
  ],
};

// Список фамилий
const lastNames = {
  male: [
    "Кузнецов",
    "Соколов",
    "Попов",
    "Васильев",
    "Петров",
    "Смирнов",
    "Михайлов",
    "Федоров",
    "Морозов",
    "Волков",
    "Алексеев",
    "Лебедев",
    "Семенов",
    "Егоров",
    "Павлов",
    "Козлов",
    "Степанов",
    "Николаев",
    "Орлов",
    "Андреев",
  ],
  female: [
    "Кузнецова",
    "Соколова",
    "Попова",
    "Васильева",
    "Петрова",
    "Смирнова",
    "Михайлова",
    "Федорова",
    "Морозова",
    "Волкова",
    "Алексеева",
    "Лебедева",
    "Семенова",
    "Егорова",
    "Павлова",
    "Козлова",
    "Степанова",
    "Николаева",
    "Орлова",
    "Андреева",
  ],
};

// Список отчеств
const middleNames = {
  male: [
    "Александрович",
    "Дмитриевич",
    "Максимович",
    "Артемович",
    "Иванович",
    "Андреевич",
    "Сергеевич",
    "Константинович",
    "Владимирович",
    "Павлович",
    "Михайлович",
    "Евгеньевич",
    "Николаевич",
    "Алексеевич",
    "Олегович",
    "Романович",
  ],
  female: [
    "Александровна",
    "Дмитриевна",
    "Максимовна",
    "Артемовна",
    "Ивановна",
    "Андреевна",
    "Сергеевна",
    "Константиновна",
    "Владимировна",
    "Павловна",
    "Михайловна",
    "Евгеньевна",
    "Николаевна",
    "Алексеевна",
    "Олеговна",
    "Романовна",
  ],
};

interface ClientData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email: string;
  discount: number | null;
}

// Генерация 100 клиентов
const generateClients = (): ClientData[] => {
  const clients: ClientData[] = [];

  for (let i = 0; i < 100; i++) {
    // Случайный пол (примерно 50/50)
    const isMale = Math.random() > 0.5;
    const gender = isMale ? "male" : "female";

    // Выбираем случайные имя, фамилию, отчество
    const firstName =
      firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
    const lastName =
      lastNames[gender][Math.floor(Math.random() * lastNames[gender].length)];
    const middleName =
      middleNames[gender][
        Math.floor(Math.random() * middleNames[gender].length)
      ];

    // Генерируем дату рождения
    const birthDate = generateBirthDate();

    // Генерируем телефон
    const phone = generatePhone();

    // Генерируем email
    const email = generateEmail(firstName, lastName, i + 1);

    // Скидка: 70% клиентов без скидки, 30% со скидкой 5-15%
    let discount: number | null = null;
    const discountChance = Math.random();
    if (discountChance > 0.7) {
      discount = random(5, 15);
    }

    clients.push({
      firstName,
      middleName,
      lastName,
      birthDate,
      phone,
      email,
      discount,
    });
  }

  return clients;
};

async function main() {
  console.log("Начинаем добавление клиентов...\n");

  const clients = generateClients();
  let created = 0;
  let withDiscount = 0;

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];

    // Сначала создаем Person
    const person = await prisma.person.create({
      data: {
        firstName: client.firstName,
        middleName: client.middleName,
        lastName: client.lastName,
        birthDate: client.birthDate,
        phone: client.phone,
        email: client.email,
      },
    });

    // Затем создаем Client, связанный с Person
    await prisma.client.create({
      data: {
        personId: person.id,
        discount: client.discount,
        firstVisit: null, // Пока без визитов, заполним позже при создании работ
      },
    });

    if (client.discount !== null) {
      withDiscount++;
    }

    created++;

    // Выводим прогресс каждые 10 клиентов
    if (created % 10 === 0) {
      console.log(`✅ Добавлено ${created} клиентов...`);
    }
  }

  console.log(`\n🎉 Готово! Добавлено ${created} клиентов.`);
  console.log(
    `📊 Из них со скидкой: ${withDiscount} (${Math.round(
      (withDiscount / created) * 100
    )}%)`
  );

  // Статистика по возрастам
  const ages = clients.map((c) => {
    const age = new Date().getFullYear() - c.birthDate.getFullYear();
    return age;
  });

  const ageGroups = {
    "Дети (5-17 лет)": ages.filter((a) => a >= 5 && a <= 17).length,
    "Молодежь (18-30 лет)": ages.filter((a) => a >= 18 && a <= 30).length,
    "Взрослые (31-50 лет)": ages.filter((a) => a >= 31 && a <= 50).length,
    "Старшие (51-65 лет)": ages.filter((a) => a >= 51 && a <= 65).length,
    "Пожилые (66+ лет)": ages.filter((a) => a >= 66).length,
  };

  console.log("\n📈 Возрастная статистика:");
  Object.entries(ageGroups).forEach(([group, count]) => {
    console.log(
      `   ${group}: ${count} клиентов (${Math.round((count / created) * 100)}%)`
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при добавлении клиентов:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
