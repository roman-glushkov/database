const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const services = db.collection("services");

    const result = await services.find({ price: { $gt: 1000 } }).toArray();

    console.log(result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();

/*
C:\PGTU\DB\lab8>node Record_Search/6comparison_operator.js
[
  {
    _id: new ObjectId('69c232f12a6a93252484f1e0'),
    name: 'Женская стрижка',
    duration: 60,
    price: 1500,
    category: 'стрижки'
  },
  {
    _id: new ObjectId('69c232f12a6a93252484f1e2'),
    name: 'Окрашивание',
    duration: 120,
    price: 3500,
    category: 'окрашивание'
  }
]
 */
