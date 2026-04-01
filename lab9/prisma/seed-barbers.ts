import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const barbersData = [
  {
    firstName: "Александр",
    lastName: "Кузнецов",
    middleName: "Игоревич",
    phone: "+79011234567",
    email: "alex.kuznetsov@example.com",
    experience: 8,
    specialization: "Мужские стрижки",
  },
  {
    firstName: "Дмитрий",
    lastName: "Соколов",
    middleName: "Андреевич",
    phone: "+79021234568",
    email: "dmitry.sokolov@example.com",
    experience: 5,
    specialization: "Окрашивание",
  },
  {
    firstName: "Елена",
    lastName: "Попова",
    middleName: "Владимировна",
    phone: "+79031234569",
    email: "elena.popova@example.com",
    experience: 10,
    specialization: "Женские стрижки",
  },
  {
    firstName: "Сергей",
    lastName: "Лебедев",
    middleName: "Михайлович",
    phone: "+79041234570",
    email: "sergey.lebedev@example.com",
    experience: 3,
    specialization: "Укладка",
  },
  {
    firstName: "Анна",
    lastName: "Козлова",
    middleName: "Алексеевна",
    phone: "+79051234571",
    email: "anna.kozlov@example.com",
    experience: 6,
    specialization: "Окрашивание",
  },
  {
    firstName: "Иван",
    lastName: "Новиков",
    middleName: "Дмитриевич",
    phone: "+79061234572",
    email: "ivan.novikov@example.com",
    experience: 4,
    specialization: "Мужские стрижки",
  },
  {
    firstName: "Мария",
    lastName: "Морозова",
    middleName: "Сергеевна",
    phone: "+79071234573",
    email: "maria.morozova@example.com",
    experience: 7,
    specialization: "Коррекция бровей",
  },
  {
    firstName: "Павел",
    lastName: "Петров",
    middleName: "Николаевич",
    phone: "+79081234574",
    email: "pavel.petrov@example.com",
    experience: 2,
    specialization: "Уходовые процедуры",
  },
  {
    firstName: "Ольга",
    lastName: "Волкова",
    middleName: "Андреевна",
    phone: "+79091234575",
    email: "olga.volkova@example.com",
    experience: 9,
    specialization: "Наращивание волос",
  },
  {
    firstName: "Максим",
    lastName: "Зайцев",
    middleName: "Васильевич",
    phone: "+79101234576",
    email: "maxim.zaytsev@example.com",
    experience: 5,
    specialization: "Химическая завивка",
  },
  {
    firstName: "Татьяна",
    lastName: "Павлова",
    middleName: "Игоревна",
    phone: "+79111234577",
    email: "tatiana.pavlova@example.com",
    experience: 11,
    specialization: "Вечерние прически",
  },
  {
    firstName: "Андрей",
    lastName: "Смирнов",
    middleName: "Александрович",
    phone: "+79121234578",
    email: "andrey.smirnov@example.com",
    experience: 4,
    specialization: "Мужские стрижки",
  },
  {
    firstName: "Наталья",
    lastName: "Голубева",
    middleName: "Владимировна",
    phone: "+79131234579",
    email: "natalia.golubeva@example.com",
    experience: 6,
    specialization: "Свадебные прически",
  },
  {
    firstName: "Кирилл",
    lastName: "Федоров",
    middleName: "Евгеньевич",
    phone: "+79141234580",
    email: "kirill.fedorov@example.com",
    experience: 3,
    specialization: "Укладка",
  },
  {
    firstName: "Юлия",
    lastName: "Тихонова",
    middleName: "Дмитриевна",
    phone: "+79151234581",
    email: "yulia.tihonova@example.com",
    experience: 7,
    specialization: "Лечение волос",
  },
  {
    firstName: "Артем",
    lastName: "Соловьев",
    middleName: "Иванович",
    phone: "+79161234582",
    email: "artem.soloviev@example.com",
    experience: 5,
    specialization: "Окрашивание",
  },
  {
    firstName: "Виктория",
    lastName: "Васильева",
    middleName: "Алексеевна",
    phone: "+79171234583",
    email: "viktoria.vasilyeva@example.com",
    experience: 8,
    specialization: "Женские стрижки",
  },
  {
    firstName: "Евгений",
    lastName: "Михайлов",
    middleName: "Сергеевич",
    phone: "+79181234584",
    email: "evgeny.mihaylov@example.com",
    experience: 4,
    specialization: "Мужские стрижки",
  },
  {
    firstName: "Ирина",
    lastName: "Андреева",
    middleName: "Павловна",
    phone: "+79191234585",
    email: "irina.andreeva@example.com",
    experience: 6,
    specialization: "Уходовые процедуры",
  },
  {
    firstName: "Никита",
    lastName: "Орлов",
    middleName: "Витальевич",
    phone: "+79201234586",
    email: "nikita.orlov@example.com",
    experience: 2,
    specialization: "Коррекция бровей",
  },
];

async function main() {
  console.log("🌱 Добавляем парикмахеров...");

  for (const barber of barbersData) {
    // Создаем человека
    const person = await prisma.person.create({
      data: {
        firstName: barber.firstName,
        lastName: barber.lastName,
        middleName: barber.middleName,
        phone: barber.phone,
        email: barber.email,
      },
    });

    // Создаем парикмахера
    await prisma.barber.create({
      data: {
        personId: person.id,
        experience: barber.experience,
        specialization: barber.specialization,
      },
    });

    console.log(
      `  ✅ ${barber.lastName} ${barber.firstName} - ${barber.specialization}`
    );
  }

  console.log(`\n✅ Добавлено ${barbersData.length} парикмахеров!`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
