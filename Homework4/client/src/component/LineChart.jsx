
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function LineChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const keys = ["Open", "High", "Low", "Close"];
    const cleanedData = data
      .map(d => ({
        ...d,
        date: new Date(d.date),
        Open: +d.Open,
        High: +d.High,
        Low: +d.Low,
        Close: +d.Close
      }))
      .filter(d => d.date instanceof Date && !isNaN(d.date) && keys.every(k => !isNaN(d[k])));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 230;
    const margin = { top: 20, right: 100, bottom: 40, left: 50 };

    const colors = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeTableau10);

    const x = d3.scaleTime()
      .domain(d3.extent(cleanedData, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(keys.map(k => d3.min(cleanedData, d => d[k]))),
        d3.max(keys.map(k => d3.max(cleanedData, d => d[k])))
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // === CLIP PATH ===
    const clip = svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const chartArea = svg.append("g")
      .attr("clip-path", "url(#clip)");

    // === LINES ===
    const lineGenerator = key => d3.line()
      .x(d => x(d.date))
      .y(d => y(d[key]));

    const lines = {};
    keys.forEach(key => {
      lines[key] = chartArea.append("path")
        .datum(cleanedData)
        .attr("fill", "none")
        .attr("stroke", colors(key))
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator(key));
    });

    // === AXES ===
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // === AXIS LABELS ===
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 5})`)
      .style("text-anchor", "middle")
      .text("Date");

    svg.append("text")
      .attr("transform", `translate(15, ${height / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Price");

    // === LEGEND ===
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    keys.forEach((key, i) => {
      legend.append("rect")
        .attr("x", 0).attr("y", i * 20)
        .attr("width", 12).attr("height", 12)
        .attr("fill", colors(key));
      legend.append("text")
        .attr("x", 18).attr("y", i * 20 + 10)
        .text(key)
        .attr("font-size", "12px");
    });

    // === ZOOM + PAN ===
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, 0], [width - margin.right, height]])
      .extent([[margin.left, 0], [width - margin.right, height]])
      .on("zoom", event => {
        const newX = event.transform.rescaleX(x);

        // Update lines
        keys.forEach(key => {
          lines[key].attr("d", d3.line()
            .x(d => newX(d.date))
            .y(d => y(d[key]))(cleanedData));
        });

        // Update x-axis
        svg.select(".x-axis").call(d3.axisBottom(newX));
      });

    svg.append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(zoom);

  }, [data]);

  return (
    <div style={{ width: "100%", overflowX: "auto", height: "250px" }}>
      <svg ref={ref} width={800} height={250}></svg>
    </div>
  );
  
}
