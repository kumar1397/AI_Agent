const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const uri = process.env.MONGODB_URL
const client = new MongoClient(uri);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "UPDATE", "DELETE"],
  })
);
app.get('/query', async (req, res) => {
  console.log("Querying data...");
  const data = req.data;
  console.log(data);
  try {
    await client.connect();
    const db = client.db('newData');
    const result = await db.collection('your_collection').aggregate([
      { $group: { _id: '$category', total: { $sum: '$value' } } }
    ]).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));
