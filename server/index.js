const express = require('express');
const chrono = require('chrono-node');
const cors = require('cors');
const natural = require('natural');
const compromise = require('compromise');
require('dotenv').config();
const database = require('./config/database');
const Data = require('./models/Data');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database interaction logic
async function fetchData(intent, entities) {
  try {
    await database(); // Ensure database is connected
    let query = {};
    let projection = {};
    let results;

    if (entities.filters.location) {
      query.location = entities.filters.location; // Filter by location
    }

    if (Array.isArray(entities.fields) && entities.fields.length > 0) {
      entities.fields.forEach((field) => {
        projection[field] = 1; // Include specific fields
      });
    }
    const defaultQuery = {};
    const defaultProjection = { vendor: 1, date: 1, amount: 1, category: 1 };

    if (intent === 'retrieve') {
      results = await Data.find(defaultQuery, defaultProjection); // Fetch matching documents
      console.log('Results:', results);
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
    return results; // Ensure results are returned
  } catch (error) {
    console.error('Error in fetchData:', error);
    throw new Error('Database operation failed');
  }
}


// API Endpoint
app.post('/query', async (req, res) => {
  try {
    const query = req.body.query;
    const response = {
      intent: null,
      entities: {
        collection: null,
        fields: [],
        filters: {},
        operation: null,
      },
    };

    const lowerCaseQuery = query.toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(lowerCaseQuery);

    if (lowerCaseQuery.includes('list') || lowerCaseQuery.includes('show me')) {
      response.intent = 'retrieve';
    } else if (lowerCaseQuery.includes('count')) {
      response.intent = 'count';
    } else if (lowerCaseQuery.includes('average') || lowerCaseQuery.includes('sum')) {
      response.intent = 'aggregate';
    } else {
      response.intent = 'unknown';
    }

    const doc = compromise(lowerCaseQuery);
    const nouns = doc.nouns().out('array');
    if (nouns.length > 0) {
      response.entities.collection = nouns[0];
    }
    const parsedDates = chrono.parseDate(lowerCaseQuery);
    if (parsedDates) {
      response.entities.filters.date = parsedDates;
    }

    const places = doc.places().out('array');
    if (places.length > 0) {
      response.entities.filters.location = places[0];
    }

    const keywords = ['average', 'value', 'total', 'orders', 'users'];
    response.entities.fields = tokens.filter((token) => keywords.includes(token));
    console.log(response);
    // Fetch data from the database
    const results = await fetchData(response.intent, response.entities);
    return res.status(200).json({
      success: true,
      message: 'Query processed successfully',
      data: results,
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start the server
app.listen(4000, () => console.log('Server running on port 4000'));
