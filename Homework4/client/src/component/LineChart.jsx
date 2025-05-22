import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Brush,
  ResponsiveContainer,
} from "recharts";

function LineChartComponent({ ticker }) {
  const [chartData, setChartData] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:8000/stock/${ticker}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched stock data:", json.stock_series);

        const cleaned = json.stock_series
          .map((d) => ({
            date: d.Date,
            Open: parseFloat(d.Open),
            High: parseFloat(d.High),
            Low: parseFloat(d.Low),
            Close: parseFloat(d.Close),
          }))
          .filter(
            (d) =>
              !isNaN(d.Open) &&
              !isNaN(d.High) &&
              !isNaN(d.Low) &&
              !isNaN(d.Close) &&
              d.date
          );

        console.log("Cleaned chart data:", cleaned);
        setChartData(cleaned);
      })
      .catch((err) => console.error("Failed to load stock data:", err));
  }, [ticker]);

  const getZoomedData = () => {
    if (zoomLevel <= 1) return chartData;
    const startIndex = Math.floor(chartData.length * (1 - 1 / zoomLevel));
    return chartData.slice(startIndex);
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(z + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(z - 0.5, 1));
  };

  return (
    <div className="rounded-2xl shadow-md p-4 bg-white border border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">Line Chart for {ticker}</h2>
        <div className="space-x-2">
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-sm border rounded bg-blue-100 hover:bg-blue-200"
          >
            Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-sm border rounded bg-blue-100 hover:bg-blue-200"
          >
            Zoom Out
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={getZoomedData()}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) =>
              new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            angle={-30}
            textAnchor="end"
            interval="preserveStartEnd"
            height={60}
            tickMargin={10}
          />
          <YAxis
            label={{ value: "Price (USD)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="Open" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="High" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="Low" stroke="#f0ad4e" dot={false} />
          <Line type="monotone" dataKey="Close" stroke="#ff7300" dot={false} />
          <Brush dataKey="date" height={20} stroke="#8884d8" y={310} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartComponent;
