const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const hairdressers = db.collection("hairdressers");

    const result = await hairdressers.findOne({
      "schedule.saturday": "10:00-15:00",
    });

    console.log(result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();

/*
C:\PGTU\DB\lab8>node Record_Search/3nested_attribute.js
{
  _id: new ObjectId('69c245582274f00ed47655c1'),
  name: 'Анна Петрова',
  experience: 5,
  specialization: 'Женские стрижки',
  phone: '+7-999-123-45-67',
  certificates: [ 'Стрижки 2020', 'Колорист 2022', 'Премиум мастер 2023' ],
  schedule: {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: 'выходной',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '10:00-15:00',
    sunday: 'выходной'
  }
}
 */
