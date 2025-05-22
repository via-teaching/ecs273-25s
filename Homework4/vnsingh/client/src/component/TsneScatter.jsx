import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TsneScatter = ({ selectedStock }) => {
  const svgRef = useRef();
  const [points, setPoints] = useState([]);

  const width = 600;
  const height = 400;
  const margin = { top: 30, right: 150, bottom: 40, left: 50 };

  useEffect(() => {
    fetch("http://localhost:8000/tsne/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched t-SNE data:", data);
        setPoints(data);
      })
      .catch((error) => console.error("Error fetching t-SNE data:", error));
  }, []);

  useEffect(() => {
    if (points.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const plotArea = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("class", "plot-area");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xExtent = d3.extent(points, d => d.x);
    const yExtent = d3.extent(points, d => d.y);

    const xScale = d3.scaleLinear().domain(xExtent).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yExtent).range([innerHeight, 0]);

    const xAxis = plotArea.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(xScale));

    const yAxis = plotArea.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    const circlesGroup = plotArea.append("g").attr("class", "circles");
    const labelsGroup = plotArea.append("g").attr("class", "labels");

    circlesGroup.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", d => d.Stock === selectedStock ? 6 : 4)
      .attr("fill", d => d.color)
      .attr("stroke", d => d.Stock === selectedStock ? "#000" : "none")
      .attr("stroke-width", d => d.Stock === selectedStock ? 2 : 0)
      .attr("opacity", 0.8);

    labelsGroup.selectAll("text.label")
      .data(points)
      .enter()
      .append("text")
      .attr("class", "label")
      .text(d => d.Stock)
      .attr("x", d => xScale(d.x) + 6)
      .attr("y", d => yScale(d.y) + 4)
      .style("font-size", "10px")
      .style("fill", "#333");

    // 🧭 Sector Legend
    const sectors = Array.from(new Set(points.map(d => d.sector)));
    const colorMap = {};
    for (const d of points) {
      if (!colorMap[d.sector]) colorMap[d.sector] = d.color;
    }

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    sectors.forEach((sector, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      legendRow.append("rect").attr("width", 12).attr("height", 12).attr("fill", colorMap[sector]);
      legendRow.append("text").attr("x", 16).attr("y", 10).text(sector)
        .style("font-size", "10px")
        .style("alignment-baseline", "middle");
    });

    // ✅ Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const transform = event.transform;
        const newX = transform.rescaleX(xScale);
        const newY = transform.rescaleY(yScale);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        circlesGroup.selectAll("circle")
          .attr("cx", d => newX(d.x))
          .attr("cy", d => newY(d.y));

        labelsGroup.selectAll("text.label")
          .attr("x", d => newX(d.x) + 6)
          .attr("y", d => newY(d.y) + 4);
      });

    svg.call(zoom);
  }, [points, selectedStock]);

  return <svg ref={svgRef}></svg>;
};

export default TsneScatter;
