import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

type StockData = {
  Date: string;  // keep as string for x axis
  Open: number;
  High: number;
  Low: number;
  Close: number;
};

type StockPriceChartProps = {
  selectedStock: string;
};

const StockPriceChart: React.FC<StockPriceChartProps> = ({ selectedStock }) => {
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/stock/${selectedStock}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const parsedData: StockData[] = data.stock_series.map((d: any) => ({
          Date: d.date,  // note lowercase `date`
          Open: +d.Open,
          High: +d.High,
          Low: +d.Low,
          Close: +d.Close,
        }));
        setData(parsedData);
      })
      .catch((err) => {
        console.error("Failed to load stock data:", err);
        setData([]);
      });
  }, [selectedStock]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="Date"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={Math.floor(data.length / 10)}
          label={{ value: "Date", position: "bottom", offset: 60 }}
          tickFormatter={(str) => {
            if (!str) return "";
            // replace space with T to make ISO format parseable
            const isoStr = str.replace(" ", "T");
            const date = new Date(isoStr);
            if (isNaN(date.getTime())) return str;
            // format MM/DD
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          label={{
            value: "Price (USD)",
            angle: -90,
            position: "insideLeft",
            offset: 10,
          }}
        />
        <Tooltip
          labelFormatter={(label) => {
            // for tooltip, show full date so that it is nicely formatted
            if (!label) return "";
            const isoStr = label.replace(" ", "T");
            const date = new Date(isoStr);
            if (isNaN(date.getTime())) return label;
            return date.toLocaleDateString();
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line type="monotone" dataKey="Open" stroke="#8884d8" dot={false} />
        <Line type="monotone" dataKey="High" stroke="#82ca9d" dot={false} />
        <Line type="monotone" dataKey="Low" stroke="#ff7300" dot={false} />
        <Line type="monotone" dataKey="Close" stroke="#387908" dot={false} />
        <Brush dataKey="Date" height={30} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockPriceChart;
