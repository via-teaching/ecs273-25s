import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function TSNEScatterPlot({ selectedTicker }) {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/tsne.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const cleaned = results.data.filter(d => d.x !== undefined && d.y !== undefined);
            setData(cleaned);
          },
        });
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x))
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.y))
      .range([chartHeight, 0]);

    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(data.map((d) => d.sector))]);

    // Draw points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", (d) => d.label === selectedTicker ? 6 : 3)
      .attr("fill", (d) => colorScale(d.sector))
      .attr("stroke", d => d.label === selectedTicker ? "#000" : "none");

    // Label selected ticker
    const selected = data.find(d => d.label === selectedTicker);
    if (selected) {
      g.append("text")
        .attr("x", xScale(selected.x) + 6)
        .attr("y", yScale(selected.y))
        .text(selected.label)
        .attr("font-size", "0.75rem")
        .attr("font-weight", "bold")
        .attr("fill", "#000");
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(6));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6));

  }, [data, selectedTicker]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
}
