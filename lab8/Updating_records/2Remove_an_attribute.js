const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const hairdressers = db.collection("hairdressers");

    const result = await hairdressers.updateOne(
      { name: "Анна Петрова" },
      { $unset: { certificates: "" } }
    );

    console.log(`Удалено: ${result.modifiedCount} документ(ов)`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();

/*
C:\PGTU\DB\lab8>node Updating_records/2Remove_an_attribute.js
Удалено: 1 документ(ов)
 */
