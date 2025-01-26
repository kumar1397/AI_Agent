"use client";
import React, { useState } from "react";
import "chart.js/auto";

function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]); // State to hold fetched data
  const [error, setError] = useState(null); // State to handle errors

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const res = await fetch("http://localhost:4000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await res.json();
      if (result.success) {
        setData(result.data); // Update state with fetched data
      } else {
        setError(result.error || "No data found.");
      }
    } catch (error) {
      console.error("Error fetching query results:", error);
      setError("An error occurred while fetching the data.");
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
          className="p-3 w-80 border text-gray-500 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {/* Data Display */}
      {data.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <table className="table-auto w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-gray-600 font-medium border border-gray-300"
                  >
                    {key.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(item).map((value, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-2 border border-gray-300 text-gray-700"
                    >
                      {value && typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="text-center text-gray-500 mt-6">
            No data available. Submit a query to see results.
          </div>
        )
      )}
    </div>
  );
}

export default App;
