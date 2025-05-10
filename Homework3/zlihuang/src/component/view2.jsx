import * as d3 from "d3";
import { useEffect, useRef } from "react";

const tickers = [
  'XOM', 'CVX', 'HAL',
  'MMM', 'CAT', 'DAL',
  'MCD', 'NKE', 'KO',
  'JNJ', 'PFE', 'UNH',
  'JPM', 'GS', 'BAC',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
];

const sectors = [
  "Energy", "Energy", "Energy",
  "Industrials", "Industrials", "Industrials",
  "Consumer", "Consumer", "Consumer",
  "Healthcare", "Healthcare", "Healthcare",
  "Financials", "Financials", "Financials",
  "Tech", "Tech", "Tech", "Tech", "Tech"
];

const margin = { top: 20, right: 20, bottom: 60, left: 40 };

export function ScatterPlot({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const path = "../../data/tsne.csv";

    d3.csv(path, (d, i) => ({
      ticker: tickers[i],
      sector: sectors[i],
      x: +d.x,
      y: +d.y
    })).then(data => {
      drawScatter(svgRef.current, data, selectedStock, width, height);
    });
  }, [selectedStock]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

function drawScatter(svgElement, data, selectedStock, width, height) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const color = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.sector))])
    .range(d3.schemeCategory10);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .range([height - margin.bottom, margin.top]);

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const dataGroup = svg.append("g").attr("class", "data-layer");
  const xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  
  const yAxisGroup = svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .text("t-SNE X");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("t-SNE Y");

  
  const zoom = d3.zoom()
  .scaleExtent([1, 5])
  .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
  .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
  .on("zoom", (event) => {
    const transform = event.transform;

    const newXScale = transform.rescaleX(xScale);
    const newYScale = transform.rescaleY(yScale);

    xAxisGroup.call(d3.axisBottom(newXScale));
    yAxisGroup.call(d3.axisLeft(newYScale));

    // Update circles check over the axis
    dataGroup.selectAll("circle")
      .attr("cx", d => {
        const cx = newXScale(d.x);
        return cx;
      })
      .attr("cy", d => {
        const cy = newYScale(d.y);
        return cy;
      })
      .attr("display", d => {
        const cx = newXScale(d.x);
        const cy = newYScale(d.y);
        return (
          cx < margin.left || cx > width - margin.right ||
          cy < margin.top || cy > height - margin.bottom
        ) ? "none" : "inline";
      })
      .attr("r", d => (d.ticker === selectedStock ? 6 : 3) * event.transform.k);
    
    // Update labels and check over the axis
    dataGroup.selectAll("text")
      .attr("x", d => newXScale(d.x) + 5 * event.transform.k)
      .attr("y", d => newYScale(d.y) - 5 * event.transform.k)
      .attr("display", d => {
        const cx = newXScale(d.x);
        const cy = newYScale(d.y);
        return (
          cx < margin.left || cx > width - margin.right ||
          cy < margin.top || cy > height - margin.bottom
        ) ? "none" : "inline";
      })
      .style("font-size", `${12 * event.transform.k}px`);
  });

  svg.call(zoom);

  // Draw circles
  dataGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", d => d.ticker === selectedStock ? 6 : 3)
    .attr("fill", d => color(d.sector))
    .attr("stroke", d => d.ticker === selectedStock ? "black" : "none")
    .attr("stroke-width", 1.5);

  // Highlight label
  dataGroup.selectAll("text")
    .data(data.filter(d => d.ticker === selectedStock))
    .enter()
    .append("text")
    .attr("x", d => xScale(d.x) + 5)
    .attr("y", d => yScale(d.y) - 5)
    .text(d => d.ticker)
    .style("font-size", "12px");

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100}, ${margin.top})`);
  [...new Set(data.map(d => d.sector))].forEach((sector, i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    row.append("rect").attr("width", 10).attr("height", 10).attr("fill", color(sector));
    row.append("text").attr("x", 15).attr("y", 10).text(sector).style("font-size", "12px");
  });
}
