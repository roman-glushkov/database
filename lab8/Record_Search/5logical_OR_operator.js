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
      price: 1500,
      $or: [{ duration: 60 }, { duration: 40 }],
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
C:\PGTU\DB\lab8>node Record_Search/5logical_OR_operator.js
{
  _id: new ObjectId('69c232f12a6a93252484f1e0'),
  name: 'Женская стрижка',
  duration: 60,
  price: 1500,
  category: 'стрижки'
}
 */
