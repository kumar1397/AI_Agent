"use client"
import React, { useState } from 'react';
import 'chart.js/auto';

function App() {
  const [query, setQuery] = useState('');
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/query', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), 
      });
      const data = await res.json();
      console.log("Data:", data);

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

    </div>
  );
}

export default App;
