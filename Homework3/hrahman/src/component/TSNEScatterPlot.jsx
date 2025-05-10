import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

const ticker_to_sector = {
  'XOM': "Energy", 'CVX': "Energy", 'HAL': "Energy",
  'MMM': "Industrials", 'CAT': "Industrials", 'DAL': "Industrials",
  'MCD': "Consumer Discretionary/Staples", 'NKE': "Consumer Discretionary/Staples", 'KO': "Consumer Discretionary/Staples",
  'JNJ': "Healthcare", 'PFE': "Healthcare", 'UNH': "Healthcare",
  'JPM': "Financials", 'GS': "Financials", 'BAC': "Financials",
  'AAPL': "Information Tech / Comm. Svc", 'MSFT': "Information Tech / Comm. Svc",
  'NVDA': "Information Tech / Comm. Svc", 'GOOGL': "Information Tech / Comm. Svc", 'META': "Information Tech / Comm. Svc"
};

const SECTOR_COLORS = {
  "Energy": "#1f77b4",
  "Industrials": "#ff7f0e",
  "Consumer Discretionary/Staples": "#2ca02c",
  "Healthcare": "#d62728",
  "Financials": "#9467bd",
  "Information Tech / Comm. Svc": "#8c564b"
};

export default function TSNEScatterPlot({ selectedTicker }) {
  const svgRef = useRef();
  const zoomRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/tsne.csv")
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const cleaned = results.data
              .filter(d => d.x !== undefined && d.y !== undefined && ticker_to_sector[d.label])
              .map(d => ({
                ...d,
                sector: ticker_to_sector[d.label]
              }));
            setData(cleaned);
          },
        });
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([chartHeight, 0]);

    const xAxis = g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale));

    const yAxis = g.append("g").call(d3.axisLeft(yScale));

    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 30)
      .attr("text-anchor", "middle")
      .text("X (t-SNE)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .text("Y (t-SNE)");

    const chartBody = g.append("g");

    chartBody.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", d => d.label === selectedTicker ? 6 : 3)
      .attr("fill", d => SECTOR_COLORS[d.sector] || "gray")
      .attr("stroke", d => d.label === selectedTicker ? "#000" : "none");

    const selected = data.find(d => d.label === selectedTicker);
    if (selected) {
      chartBody.append("text")
        .attr("x", xScale(selected.x) + 8)
        .attr("y", yScale(selected.y) - 8)
        .text(selected.label)
        .attr("font-size", "0.75rem")
        .attr("font-weight", "bold")
        .attr("fill", "#000");
    }

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        chartBody.selectAll("circle")
          .attr("cx", d => newX(d.x))
          .attr("cy", d => newY(d.y));

        chartBody.selectAll("text")
          .attr("x", d => newX(selected?.x) + 8)
          .attr("y", d => newY(selected?.y) - 8);
      });

    svg.call(zoom);
    zoomRef.current = zoom;
  }, [data, selectedTicker]);

  const handleZoom = (factor) => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  return (
    <div className="flex w-full h-[400px]">
      {/* Left side: Chart */}
      <div className="w-3/4">
        <svg ref={svgRef}></svg>
      </div>
  
      {/* Right side: Legend and Buttons in two clean blocks */}
      <div className="w-1/4 flex flex-col justify-between px-4 py-4">
        {/* Sector Legend */}
        <div>
          <div className="text-sm font-semibold mb-3">Sectors</div>
          <div className="flex flex-col gap-3 text-sm">
            {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
              <div key={sector} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
                <span className="whitespace-normal">{sector}</span>
              </div>
            ))}
          </div>
        </div>
  
        {/* Buttons Column */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleZoom(1.2)}
            className="w-28 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded shadow text-sm"
          >
            Zoom In
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="w-28 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded shadow text-sm"
          >
            Zoom Out
          </button>
          <button
            onClick={() =>
              d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.transform, d3.zoomIdentity)
            }
            className="w-28 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded shadow text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
  
}
