const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const hairdressers = db.collection("hairdressers");
    const reviews = db.collection("reviews");

    const deleteOneResult = await hairdressers.deleteOne({
      name: "Ольга Кузнецова",
    });
    console.log(`deleteOne: ${deleteOneResult.deletedCount}`);

    const deleteManyResult = await reviews.deleteMany({ rating: 5 });
    console.log(`deleteMany: ${deleteManyResult.deletedCount}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();

/*
C:\PGTU\DB\lab8>node Deleting_records.js
deleteOne: 1
deleteMany: 3
*/
