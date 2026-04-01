import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clientsData = [
  {
    firstName: "Алексей",
    lastName: "Иванов",
    middleName: "Дмитриевич",
    birthDate: "1990-05-15",
    phone: "+79161234567",
    email: "aleksey.ivanov@example.com",
    discount: 5,
  },
  {
    firstName: "Екатерина",
    lastName: "Петрова",
    middleName: "Андреевна",
    birthDate: "1988-08-22",
    phone: "+79162345678",
    email: "ekaterina.petrova@example.com",
    discount: 10,
  },
  {
    firstName: "Дмитрий",
    lastName: "Сидоров",
    middleName: "Николаевич",
    birthDate: "1995-03-10",
    phone: "+79163456789",
    email: "dmitry.sidorov@example.com",
    discount: 0,
  },
  {
    firstName: "Ольга",
    lastName: "Кузнецова",
    middleName: "Владимировна",
    birthDate: "1992-11-30",
    phone: "+79164567890",
    email: "olga.kuznetsova@example.com",
    discount: 15,
  },
  {
    firstName: "Сергей",
    lastName: "Михайлов",
    middleName: "Сергеевич",
    birthDate: "1985-07-18",
    phone: "+79165678901",
    email: "sergey.mihaylov@example.com",
    discount: 7,
  },
  {
    firstName: "Анна",
    lastName: "Соколова",
    middleName: "Игоревна",
    birthDate: "1993-02-25",
    phone: "+79166789012",
    email: "anna.sokolova@example.com",
    discount: 20,
  },
  {
    firstName: "Игорь",
    lastName: "Волков",
    middleName: "Павлович",
    birthDate: "1987-09-12",
    phone: "+79167890123",
    email: "igor.volkov@example.com",
    discount: 3,
  },
  {
    firstName: "Мария",
    lastName: "Лебедева",
    middleName: "Алексеевна",
    birthDate: "1998-04-05",
    phone: "+79168901234",
    email: "maria.lebedeva@example.com",
    discount: 12,
  },
  {
    firstName: "Владимир",
    lastName: "Козлов",
    middleName: "Евгеньевич",
    birthDate: "1991-06-28",
    phone: "+79169012345",
    email: "vladimir.kozlov@example.com",
    discount: 0,
  },
  {
    firstName: "Наталья",
    lastName: "Новикова",
    middleName: "Дмитриевна",
    birthDate: "1989-12-15",
    phone: "+79170123456",
    email: "natalya.novikova@example.com",
    discount: 8,
  },
  {
    firstName: "Андрей",
    lastName: "Морозов",
    middleName: "Александрович",
    birthDate: "1994-10-08",
    phone: "+79171234567",
    email: "andrey.morozov@example.com",
    discount: 5,
  },
  {
    firstName: "Татьяна",
    lastName: "Васильева",
    middleName: "Сергеевна",
    birthDate: "1996-01-20",
    phone: "+79172345678",
    email: "tatiana.vasilyeva@example.com",
    discount: 10,
  },
  {
    firstName: "Михаил",
    lastName: "Зайцев",
    middleName: "Иванович",
    birthDate: "1986-03-14",
    phone: "+79173456789",
    email: "mikhail.zaytsev@example.com",
    discount: 0,
  },
  {
    firstName: "Юлия",
    lastName: "Степанова",
    middleName: "Владимировна",
    birthDate: "1997-07-22",
    phone: "+79174567890",
    email: "yulia.stepanova@example.com",
    discount: 18,
  },
  {
    firstName: "Николай",
    lastName: "Андреев",
    middleName: "Федорович",
    birthDate: "1984-11-03",
    phone: "+79175678901",
    email: "nikolay.andreev@example.com",
    discount: 5,
  },
  {
    firstName: "Ирина",
    lastName: "Тихонова",
    middleName: "Андреевна",
    birthDate: "1999-09-17",
    phone: "+79176789012",
    email: "irina.tihonova@example.com",
    discount: 12,
  },
  {
    firstName: "Евгений",
    lastName: "Федоров",
    middleName: "Максимович",
    birthDate: "1993-04-12",
    phone: "+79177890123",
    email: "evgeny.fedorov@example.com",
    discount: 0,
  },
  {
    firstName: "Светлана",
    lastName: "Орлова",
    middleName: "Николаевна",
    birthDate: "1990-08-25",
    phone: "+79178901234",
    email: "svetlana.orlova@example.com",
    discount: 15,
  },
  {
    firstName: "Артем",
    lastName: "Егоров",
    middleName: "Сергеевич",
    birthDate: "1992-12-09",
    phone: "+79179012345",
    email: "artem.egorov@example.com",
    discount: 7,
  },
  {
    firstName: "Елена",
    lastName: "Григорьева",
    middleName: "Павловна",
    birthDate: "1988-05-30",
    phone: "+79180123456",
    email: "elena.grigoryeva@example.com",
    discount: 10,
  },
  {
    firstName: "Василий",
    lastName: "Никитин",
    middleName: "Андреевич",
    birthDate: "1995-02-18",
    phone: "+79181234567",
    email: "vasily.nikitin@example.com",
    discount: 0,
  },
  {
    firstName: "Оксана",
    lastName: "Карпова",
    middleName: "Дмитриевна",
    birthDate: "1994-06-07",
    phone: "+79182345678",
    email: "oksana.karpova@example.com",
    discount: 20,
  },
  {
    firstName: "Роман",
    lastName: "Соловьев",
    middleName: "Игоревич",
    birthDate: "1991-10-14",
    phone: "+79183456789",
    email: "roman.soloviev@example.com",
    discount: 5,
  },
  {
    firstName: "Алина",
    lastName: "Белова",
    middleName: "Александровна",
    birthDate: "1997-03-22",
    phone: "+79184567890",
    email: "alina.belova@example.com",
    discount: 12,
  },
  {
    firstName: "Виктор",
    lastName: "Тимофеев",
    middleName: "Владимирович",
    birthDate: "1986-09-11",
    phone: "+79185678901",
    email: "viktor.timofeev@example.com",
    discount: 0,
  },
  {
    firstName: "Дарья",
    lastName: "Гусева",
    middleName: "Сергеевна",
    birthDate: "1993-12-01",
    phone: "+79186789012",
    email: "darya.guseva@example.com",
    discount: 8,
  },
  {
    firstName: "Максим",
    lastName: "Денисов",
    middleName: "Алексеевич",
    birthDate: "1996-07-19",
    phone: "+79187890123",
    email: "maxim.denisov@example.com",
    discount: 10,
  },
  {
    firstName: "Ксения",
    lastName: "Киселева",
    middleName: "Игоревна",
    birthDate: "1998-11-27",
    phone: "+79188901234",
    email: "kseniya.kiseleva@example.com",
    discount: 15,
  },
  {
    firstName: "Георгий",
    lastName: "Виноградов",
    middleName: "Павлович",
    birthDate: "1989-04-03",
    phone: "+79189012345",
    email: "georgiy.vinogradov@example.com",
    discount: 0,
  },
  {
    firstName: "Людмила",
    lastName: "Борисова",
    middleName: "Николаевна",
    birthDate: "1992-08-14",
    phone: "+79190123456",
    email: "lyudmila.borisova@example.com",
    discount: 12,
  },
  {
    firstName: "Станислав",
    lastName: "Кузьмин",
    middleName: "Дмитриевич",
    birthDate: "1987-05-23",
    phone: "+79191234567",
    email: "stanislav.kuzmin@example.com",
    discount: 5,
  },
  {
    firstName: "Валентина",
    lastName: "Шестакова",
    middleName: "Владимировна",
    birthDate: "1995-09-09",
    phone: "+79192345678",
    email: "valentina.shestakova@example.com",
    discount: 18,
  },
  {
    firstName: "Даниил",
    lastName: "Панфилов",
    middleName: "Александрович",
    birthDate: "1994-12-20",
    phone: "+79193456789",
    email: "daniil.panfilov@example.com",
    discount: 0,
  },
  {
    firstName: "Софья",
    lastName: "Алексеева",
    middleName: "Сергеевна",
    birthDate: "1999-01-15",
    phone: "+79194567890",
    email: "sofya.alekseeva@example.com",
    discount: 7,
  },
  {
    firstName: "Антон",
    lastName: "Комаров",
    middleName: "Иванович",
    birthDate: "1990-06-30",
    phone: "+79195678901",
    email: "anton.komarov@example.com",
    discount: 10,
  },
  {
    firstName: "Евгения",
    lastName: "Зуева",
    middleName: "Андреевна",
    birthDate: "1993-03-25",
    phone: "+79196789012",
    email: "evgeniya.zueva@example.com",
    discount: 12,
  },
  {
    firstName: "Леонид",
    lastName: "Романов",
    middleName: "Николаевич",
    birthDate: "1985-11-11",
    phone: "+79197890123",
    email: "leonid.romanov@example.com",
    discount: 0,
  },
  {
    firstName: "Вероника",
    lastName: "Богданова",
    middleName: "Павловна",
    birthDate: "1996-05-05",
    phone: "+79198901234",
    email: "veronika.bogdanova@example.com",
    discount: 15,
  },
  {
    firstName: "Григорий",
    lastName: "Фролов",
    middleName: "Сергеевич",
    birthDate: "1991-08-08",
    phone: "+79199012345",
    email: "grigoriy.frolov@example.com",
    discount: 5,
  },
  {
    firstName: "Анастасия",
    lastName: "Николаева",
    middleName: "Владимировна",
    birthDate: "1997-12-18",
    phone: "+79200123456",
    email: "anastasia.nikolaeva@example.com",
    discount: 20,
  },
];

async function main() {
  console.log("🌱 Добавляем клиентов...");

  let created = 0;
  let skipped = 0;

  for (const client of clientsData) {
    // Проверяем, существует ли уже клиент с таким email или телефоном
    const existingPerson = await prisma.person.findFirst({
      where: {
        OR: [{ email: client.email }, { phone: client.phone }],
      },
    });

    if (existingPerson) {
      console.log(
        `  ⏭️ Пропущен: ${client.lastName} ${client.firstName} (уже существует)`
      );
      skipped++;
      continue;
    }

    // Создаем человека
    const person = await prisma.person.create({
      data: {
        firstName: client.firstName,
        lastName: client.lastName,
        middleName: client.middleName,
        birthDate: client.birthDate ? new Date(client.birthDate) : null,
        phone: client.phone,
        email: client.email,
      },
    });

    // Создаем клиента
    await prisma.client.create({
      data: {
        personId: person.id,
        discount: client.discount,
        firstVisit: null, // пока null, заполнится автоматически после первой работы
      },
    });

    console.log(
      `  ✅ ${client.lastName} ${client.firstName} - скидка ${client.discount}%`
    );
    created++;
  }

  console.log(`\n✅ Добавлено ${created} клиентов`);
  console.log(`⏭️ Пропущено ${skipped} (уже существуют)`);
  console.log(`📊 Всего клиентов в БД: ${await prisma.client.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
