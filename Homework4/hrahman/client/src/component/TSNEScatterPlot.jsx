import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ticker_to_sector = {
  'XOM': "Energy", 'CVX': "Energy", 'HAL': "Energy",
  'MMM': "Industrials", 'CAT': "Industrials", 'DAL': "Industrials",
  'MCD': "Staples", 'NKE': "Staples", 'KO': "Staples",
  'JNJ': "Healthcare", 'PFE': "Healthcare", 'UNH': "Healthcare",
  'JPM': "Financials", 'GS': "Financials", 'BAC': "Financials",
  'AAPL': "Tech", 'MSFT': "Tech",
  'NVDA': "Tech", 'GOOGL': "Tech", 'META': "Tech"
};

const SECTOR_COLORS = {
  "Energy": "#1f77b4",
  "Industrials": "#ff7f0e",
  "Staples": "#2ca02c",
  "Healthcare": "#d62728",
  "Financials": "#9467bd",
  "Tech": "#8c564b"
};

export default function TSNEScatterPlot({ selectedTicker }) {
  const svgRef = useRef();
  const zoomRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/tsne/")
      .then(res => res.json())
      .then(raw => {
        const cleaned = raw
          .filter(d => d.Stock && d.x !== undefined && d.y !== undefined)
          .map(d => ({...d,
            sector: ticker_to_sector[d.Stock]
          }));
        setData(cleaned);
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 20, bottom: 40, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip-region")
      .append("rect")
      .attr("x", -20)
      .attr("y", -40)
      .attr("width", chartWidth + 40)
      .attr("height", chartHeight + 60);

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

    const chartBody = g.append("g")
      .attr("clip-path", "url(#clip-region)");

    chartBody.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", d => d.Stock === selectedTicker ? 6 : 3)
      .attr("fill", d => SECTOR_COLORS[d.sector] || "gray")
      .attr("stroke", d => d.Stock === selectedTicker ? "#000" : "none");

    const selected = data.find(d => d.Stock === selectedTicker);
    if (selected) {
      chartBody.append("text")
        .attr("x", xScale(selected.x) + 8)
        .attr("y", yScale(selected.y) - 8)
        .text(selected.Stock)
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
    <div className="relative w-full h-[500px]">
      <div className="absolute top-3 right-3 z-10 flex flex-row items-start gap-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow text-sm">
        <div className="max-w-[200px]">
          <div className="font-semibold mb-2 text-sm">Sectors</div>
          <div className="flex flex-col gap-2">
            {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
              <div key={sector} className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: color }}></div>
                <span className="leading-tight">{sector}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => handleZoom(1.2)} className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white text-base font-bold rounded shadow">+</button>
          <button onClick={() => handleZoom(0.8)} className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white text-base font-bold rounded shadow">−</button>
          <button onClick={() =>
            d3.select(svgRef.current)
              .transition()
              .duration(300)
              .call(zoomRef.current.transform, d3.zoomIdentity)}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-800 text-white text-base font-bold rounded shadow">×</button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
