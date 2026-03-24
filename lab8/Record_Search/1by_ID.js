const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "lab8_variant2";

async function test() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const reviews = db.collection("reviews");

    const result = await reviews.findOne({
      _id: new ObjectId("69c232f12a6a93252484f1ec"),
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
C:\PGTU\DB\lab8>node Record_Search/1by_ID.js
{
  _id: new ObjectId('69c232f12a6a93252484f1ec'),
  workId: new ObjectId('69c232f12a6a93252484f1e8'),
  rating: 4,
  text: 'Стрижка хорошая, но немного долго ждала своей очереди.',
  date: 2024-03-21T00:00:00.000Z
}
 */
