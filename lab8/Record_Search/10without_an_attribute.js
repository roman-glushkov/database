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
        certificates: { $exists: false },
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
C:\PGTU\DB\lab8>node Record_Search/10without_an_attribute.js
[
  {
    _id: new ObjectId('69c24f9fe87075a606e7c9ae'),
    name: 'Ольга Кузнецова',
    experience: 3,
    specialization: 'Окрашивание',
    phone: '+7-999-345-67-89',
    schedule: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: 'выходной',
      sunday: 'выходной'
    }
  }
]
 */
