const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const services = db.collection("services");

    const result = await services.findOne({
      $and: [{ price: 1000 }, { category: "стрижки" }],
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
C:\PGTU\DB\lab8>node Record_Search/4logical_operator_AND.js
{
  _id: new ObjectId('69c232f12a6a93252484f1e1'),
  name: 'Мужская стрижка',
  duration: 40,
  price: 1000,
  category: 'стрижки'
}
 */
