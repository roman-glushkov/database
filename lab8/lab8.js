const { MongoClient, ObjectId } = require("mongodb");
const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const hairdressers = db.collection("hairdressers");
    const services = db.collection("services");
    const works = db.collection("works");
    const clients = db.collection("clients");
    const reviews = db.collection("reviews");

    await hairdressers.deleteMany({});
    await services.deleteMany({});
    await works.deleteMany({});
    await clients.deleteMany({});
    await reviews.deleteMany({});

    await hairdressers.insertOne({
      name: "Анна Петрова",
      experience: 5,
      specialization: "Женские стрижки",
      phone: "+7-999-123-45-67",
      certificates: ["Стрижки 2020", "Колорист 2022", "Премиум мастер 2023"],
      schedule: {
        monday: "09:00-18:00",
        tuesday: "09:00-18:00",
        wednesday: "выходной",
        thursday: "09:00-18:00",
        friday: "09:00-18:00",
        saturday: "10:00-15:00",
        sunday: "выходной",
      },
    });

    await hairdressers.insertMany([
      {
        name: "Елена Смирнова",
        experience: 8,
        specialization: "Мужские стрижки",
        phone: "+7-999-234-56-78",
        certificates: ["Мужские стрижки 2019", "Барбер 2021"],
        schedule: {
          monday: "10:00-19:00",
          tuesday: "10:00-19:00",
          wednesday: "10:00-19:00",
          thursday: "10:00-19:00",
          friday: "10:00-19:00",
          saturday: "10:00-14:00",
          sunday: "выходной",
        },
      },
      {
        name: "Ольга Кузнецова",
        experience: 3,
        specialization: "Окрашивание",
        phone: "+7-999-345-67-89",
        schedule: {
          monday: "09:00-17:00",
          tuesday: "09:00-17:00",
          wednesday: "09:00-17:00",
          thursday: "09:00-17:00",
          friday: "09:00-17:00",
          saturday: "выходной",
          sunday: "выходной",
        },
      },
    ]);

    await services.insertMany([
      {
        name: "Женская стрижка",
        duration: 60,
        price: 1500,
        category: "стрижки",
      },
      {
        name: "Мужская стрижка",
        duration: 40,
        price: 1000,
        category: "стрижки",
      },
      {
        name: "Окрашивание",
        duration: 120,
        price: 3500,
        category: "окрашивание",
      },
      {
        name: "Укладка",
        duration: 30,
        price: 800,
        category: "укладка",
      },
    ]);

    await clients.insertMany([
      {
        name: "Иван Иванов",
        phone: "+7-999-111-22-33",
        birthDate: new Date("1990-05-15"),
        address: "ул. Ленина, д. 10, кв. 5",
        discount: 5,
        firstVisit: new Date("2023-01-10"),
      },
      {
        name: "Мария Сидорова",
        phone: "+7-999-444-55-66",
        birthDate: new Date("1985-08-22"),
        address: "пр. Мира, д. 25, кв. 12",
        discount: 10,
        firstVisit: new Date("2023-02-15"),
      },
      {
        name: "Петр Петров",
        phone: "+7-999-777-88-99",
        birthDate: new Date("1995-03-10"),
        address: "ул. Гагарина, д. 5, кв. 8",
        discount: 0,
        firstVisit: new Date("2024-01-20"),
      },
    ]);

    const hairdresserAnna = await hairdressers.findOne({
      name: "Анна Петрова",
    });
    const hairdresserElena = await hairdressers.findOne({
      name: "Елена Смирнова",
      birthDate: new Date("1995-03-03"),
    });
    const serviceMan = await services.findOne({ name: "Мужская стрижка" });
    const serviceWoman = await services.findOne({ name: "Женская стрижка" });
    const serviceStyling = await services.findOne({ name: "Укладка" });
    const clientIvan = await clients.findOne({ name: "Иван Иванов" });
    const clientMaria = await clients.findOne({ name: "Мария Сидорова" });
    const clientPetr = await clients.findOne({ name: "Петр Петров" });

    await works.insertMany([
      {
        hairdresserId: hairdresserAnna._id,
        serviceId: serviceMan._id,
        clientId: clientIvan._id,
        date: new Date("2024-03-20"),
      },
      {
        hairdresserId: hairdresserAnna._id,
        serviceId: serviceWoman._id,
        clientId: clientMaria._id,
        date: new Date("2024-03-21"),
      },
      {
        hairdresserId: hairdresserElena._id,
        serviceId: serviceMan._id,
        clientId: clientPetr._id,
        date: new Date("2024-03-22"),
      },
      {
        hairdresserId: hairdresserAnna._id,
        serviceId: serviceStyling._id,
        clientId: clientMaria._id,
        date: new Date("2024-03-23"),
      },
    ]);

    const work1 = await works.findOne({ clientId: clientIvan._id });
    const work2 = await works.findOne({
      clientId: clientMaria._id,
      serviceId: serviceWoman._id,
    });
    const work3 = await works.findOne({ clientId: clientPetr._id });
    const work4 = await works.findOne({
      clientId: clientMaria._id,
      serviceId: serviceStyling._id,
    });

    await reviews.insertMany([
      {
        workId: work1._id,
        rating: 5,
        text: "Отличная стрижка! Мастер профессионал. Обязательно приду еще!",
        date: new Date("2024-03-20"),
      },
      {
        workId: work2._id,
        rating: 4,
        text: "Стрижка хорошая, но немного долго ждала своей очереди.",
        date: new Date("2024-03-21"),
      },
      {
        workId: work3._id,
        rating: 5,
        text: "Лучшая мужская стрижка в городе! Спасибо Елене!",
        date: new Date("2024-03-22"),
      },
      {
        workId: work4._id,
        rating: 5,
        text: "Отличная укладка, волосы выглядят шикарно!",
        date: new Date("2024-03-23"),
      },
    ]);

    console.log("Complete");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

main();

/*
C:\PGTU\DB\lab8>node lab8.js
Complete
*/
