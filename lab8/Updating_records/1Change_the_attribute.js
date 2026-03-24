const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const services = db.collection("services");

    const result = await services.updateOne(
      { name: "Мужская стрижка" },
      { $set: { price: 1200 } }
    );

    console.log(`Изменено: ${result.modifiedCount} документ(ов)`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();

/*
C:\PGTU\DB\lab8>node Updating_records/1Change_the_attribute.js
Изменено: 1 документ(ов)
 */
