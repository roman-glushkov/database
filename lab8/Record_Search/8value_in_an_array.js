const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const hairdressers = db.collection("hairdressers");

    const result = await hairdressers
      .find({
        certificates: "Барбер 2021",
      })
      .toArray();

    console.log(result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();
/*
C:\PGTU\DB\lab8>node Record_Search/8value_in_an_array.js
[
  {
    _id: new ObjectId('69c245582274f00ed47655c2'),
    name: 'Елена Смирнова',
    experience: 8,
    specialization: 'Мужские стрижки',
    phone: '+7-999-234-56-78',
    certificates: [ 'Мужские стрижки 2019', 'Барбер 2021' ],
    schedule: {
      monday: '10:00-19:00',
      tuesday: '10:00-19:00',
      wednesday: '10:00-19:00',
      thursday: '10:00-19:00',
      friday: '10:00-19:00',
      saturday: '10:00-14:00',
      sunday: 'выходной'
    }
  }
]
 */
