import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const defaultRadius = 4;
const highlightRadius = 10;

const TICKER_TO_SECTOR = {
  AAPL: "Technology",
  MSFT: "Technology",
  NVDA: "Technology",
  GOOGL: "Technology",
  META: "Technology",
  HAL: "Energy",
  XOM: "Energy",
  CVX: "Energy",
  BAC: "Financials",
  JPM: "Financials",
  GS: "Financials",
  CAT: "Industrials",
  DAL: "Industrials",
  MMM: "Industrials",
  NKE: "Consumer Discretionary",
  MCD: "Consumer Discretionary",
  KO: "Consumer Staples",
  PFE: "Health Care",
  JNJ: "Health Care",
};

export function TsneScatter({ selectedTicker, onTickerSelect }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [zoomTransform, setZoomTransform] = useState(null);

  useEffect(() => {
    d3.csv("/data/tsne.csv", d => ({
      x: +d["0"],
      y: +d["1"],
      ticker: d.Ticker,
      sector: TICKER_TO_SECTOR[d.Ticker] || "Other",
    })).then(data => {
      if (data.length > 0) {
        setPoints(data);
        if (!selectedTicker) {
          onTickerSelect(data[0].ticker); // Set initial ticker
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!points.length || !containerRef.current || !svgRef.current) return;

    const draw = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width && height) {
        drawChart(svgRef.current, points, width, height, selectedTicker, zoomTransform);
      }
    };

    draw();
    const ro = new ResizeObserver(debounce(draw, 100));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [points, selectedTicker, zoomTransform]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}

function drawChart(svgEl, data, width, height, selectedTicker, currentTransform) {
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Create scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x)).nice()
    .range([0, innerW]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y)).nice()
    .range([innerH, 0]);

  // Color scale by sector
  const sectors = Array.from(new Set(data.map(d => d.sector)));
  const color = d3.scaleOrdinal(sectors, d3.schemeTableau10);

  // Main group
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Apply existing zoom transform if available
  if (currentTransform) {
    g.attr("transform", `translate(${margin.left},${margin.top})${currentTransform}`);
  }

  // Create axes
  const xAxis = g => g
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(currentTransform ? currentTransform.rescaleX(x) : x));

  const yAxis = g => g
    .call(d3.axisLeft(currentTransform ? currentTransform.rescaleY(y) : y));

  // Draw axes
  g.append("g").call(xAxis);
  g.append("g").call(yAxis);

  // Axis labels
  svg.append("text")
    .attr("x", margin.left + innerW / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .text("t-SNE Dimension 1");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .text("t-SNE Dimension 2");

  // Draw points
  const dots = g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => currentTransform ? currentTransform.applyX(x(d.x)) : x(d.x))
    .attr("cy", d => currentTransform ? currentTransform.applyY(y(d.y)) : y(d.y))
    .attr("r", d => (d.ticker === selectedTicker ? highlightRadius : defaultRadius))
    .attr("fill", d => color(d.sector))
    .attr("stroke", d => (d.ticker === selectedTicker ? "#000" : "none"))
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      event.stopPropagation();
      // Call parent component's handler if provided
      if (typeof onTickerSelect === 'function') {
        onTickerSelect(d.ticker);
      }
    });

  // Highlight selected ticker
  if (selectedTicker) {
    const selected = data.find(d => d.ticker === selectedTicker);
    if (selected) {
      g.append("text")
        .attr("class", "ticker-label")
        .attr("x", currentTransform ? currentTransform.applyX(x(selected.x)) + highlightRadius + 3 : x(selected.x) + highlightRadius + 3)
        .attr("y", currentTransform ? currentTransform.applyY(y(selected.y)) + 4 : y(selected.y) + 4)
        .text(selected.ticker)
        .style("font-size", "0.8rem")
        .style("font-weight", "bold")
        .style("pointer-events", "none");
    }
  }

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 150}, ${margin.top})`);

  sectors.forEach((sector, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`)
      .style("cursor", "pointer")
      .on("click", () => {
        // Filter by sector if desired
      });

    legendItem.append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", color(sector));

    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(sector)
      .style("font-size", "0.75rem");
  });

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[margin.left, 0], [width - margin.right, height]])
    .on("zoom", (event) => {
      setZoomTransform(event.transform); // Update the zoom transform state
      g.attr("transform", event.transform); // Apply zoom transform
      g.selectAll("circle")
        .attr("cx", d => event.transform.applyX(x(d.x)))
        .attr("cy", d => event.transform.applyY(y(d.y)));

      svg.selectAll(".x-axis").call(d3.axisBottom(event.transform.rescaleX(x)));
      svg.selectAll(".y-axis").call(d3.axisLeft(event.transform.rescaleY(y)));
    });

  svg.call(zoom);
}