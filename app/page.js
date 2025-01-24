"use client"
import React, { useState } from 'react';
import axios from 'axios';
import 'chart.js/auto';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/query', { query });
      setResults(response.data.textResults);

      if (response.data.chartResults) {
        const labels = response.data.chartResults.labels;
        const values = response.data.chartResults.values;

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Query Results',
              data: values,
              backgroundColor: 'rgba(75,192,192,0.6)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        });
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching query results:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        AI Agent for Context-Aware Insights
      </h1>

      <form
        onSubmit={handleQuerySubmit}
        className="flex justify-center items-center mb-6 space-x-4"
      >
        <input
          type="text"
          placeholder="Enter your query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-3 w-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {results && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-2">Text Results:</h3>
          <p className="text-gray-700">{results}</p>
        </div>
      )}

      {chartData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Visualization:</h3>
          <div className="h-96">
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
