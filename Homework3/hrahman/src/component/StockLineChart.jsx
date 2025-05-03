import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function StockLineChart({ selectedTicker }) {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!selectedTicker) return;

    fetch(`/data/stockdata/${selectedTicker}.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsedData = results.data.filter(d => d.Date && d.Open); // remove bad rows
            parsedData.forEach(d => d.Date = new Date(d.Date));
            setData(parsedData);
          },
        });
      });
  }, [selectedTicker]);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => Math.min(d.Open, d.High, d.Low, d.Close)),
        d3.max(data, (d) => Math.max(d.Open, d.High, d.Low, d.Close)),
      ])
      .nice()
      .range([chartHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    const lineTypes = ["Open", "High", "Low", "Close"];
    const colors = d3.scaleOrdinal()
      .domain(lineTypes)
      .range(["steelblue", "green", "orange", "red"]);

    // Draw lines
    lineTypes.forEach((type) => {
      const line = d3
        .line()
        .x((d) => xScale(d.Date))
        .y((d) => yScale(d[type]));

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors(type))
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    // Legend
    const legend = g
      .selectAll(".legend")
      .data(lineTypes)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${i * 80}, ${-10})`);

    legend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => colors(d));

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text((d) => d)
      .style("font-size", "0.8rem");

  }, [data]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
