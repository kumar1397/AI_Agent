const express = require('express');
const cors = require('cors');
const natural = require('natural');
const compromise = require('compromise');
require('dotenv').config();
const database = require('./config/database');
const Data = require('./models/Data');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json()); 

async function fetchData(intent, entities) {
  await database(); 

  let query = {};
  let projection = {};
  let results;

  // if (entities.filters.date) {
  //   query.createdAt = parseDateFilter(entities.filters.date); 
  // }

  if (entities.filters.location) {
    query.location = entities.filters.location;
  }

  // Build projection for fields
  if (entities.fields.length > 0) {
    entities.fields.forEach(field => {
      projection[field] = 1; // Include only specific fields
    });
  }

  // Handle intents
  if (intent === 'retrieve') {
    results = await Data.find(query, projection); // Find matching documents
  } else if (intent === 'count') {
    results = await Data.countDocuments(query); // Count matching documents
  } else if (intent === 'aggregate') {
    if (entities.fields.includes('value')) {
      results = await Data.aggregate([
        { $match: query },
        { $group: { _id: null, avgValue: { $avg: '$value' } } },
      ]);
    }
  } else {
    results = { message: 'Unknown intent or unsupported operation.' };
  }
  return results;
}

// Endpoint to handle queries
app.post('/query', async (req, res) => {
  try {
    const query = req.body.query; // Use req.body, not req.data
    const response = {
      intent: null,
      entities: {
        collection: null,
        fields: [],
        filters: {},
        operation: null,
      },
    };

    // Step 2: Normalize and tokenize query
    const lowerCaseQuery = query.toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(lowerCaseQuery);

    // Step 3: Detect intent
    if (lowerCaseQuery.includes('show me') || lowerCaseQuery.includes('list')) {
      response.intent = 'retrieve';
    } else if (lowerCaseQuery.includes('count')) {
      response.intent = 'count';
    } else if (lowerCaseQuery.includes('average') || lowerCaseQuery.includes('sum')) {
      response.intent = 'aggregate';
    } else if (lowerCaseQuery.includes('visualize') || lowerCaseQuery.includes('graph') || lowerCaseQuery.includes('chart')) {
      response.intent = 'visualize';
    } else {
      response.intent = 'unknown';
    }

    // Step 4: Extract entities using compromise
    const doc = compromise(lowerCaseQuery);
    // Extract potential collections (assumes nouns are collections)
    const nouns = doc.nouns().out('array');
    if (nouns.length > 0) {
      response.entities.collection = nouns[0]; // Take the first noun as the collection
    }

    // Extract filters (e.g., conditions like "last month", "California")
    // const dates = doc.dates().out('array');
    // if (dates.length > 0) {
    //   response.entities.filters.date = dates[0];
    // }

    const places = doc.places().out('array');
    if (places.length > 0) {
      response.entities.filters.location = places[0];
    }

    // Extract fields (e.g., "average order value")
    const keywords = ['average', 'value', 'total', 'orders', 'users'];
    response.entities.fields = tokens.filter((token) => keywords.includes(token));
    console.log("this is after getting the intent and entities", response);

    // Step 5: Return parsed intent and entities
    const results = fetchData(response.intent, response.entities);;

    return res.status(201).json({
      success: true,
      message: "Got the data",
      data: results,
    });

   

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start the server
app.listen(4000, () => console.log('Server running on port 4000'));
