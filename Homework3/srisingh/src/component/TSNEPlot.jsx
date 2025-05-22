import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { csv } from "d3-fetch";

const sectorColor = {
  Energy: "#1f9e89",
  Industrials: "#f46d43",
  "Consumer Staples": "#7570b3",
  Healthcare: "#e7298a",
  Financials: "#66c2a5",
  Tech: "#ffd92f",
};

const TSNEPlot = ({ selectedTicker }) => {
  const containerRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    const drawChart = async () => {
      const data = await csv("/data/tsne.csv");
      data.forEach(d => {
        d.x = +d.x;
        d.y = +d.y;
      });

      const containerWidth = containerRef.current.offsetWidth;
      const margin = { top: 30, right: 180, bottom: 50, left: 50 };
      const width = containerWidth - margin.left - margin.right;
      const height = 450;

      d3.select(svgRef.current).selectAll("*").remove();
      d3.select(containerRef.current).select(".tooltip")?.remove();

      const svg = d3
        .select(svgRef.current)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const tooltip = d3
        .select(containerRef.current)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "6px 8px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "10")
        .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)");

      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height, 0]);

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g").call(d3.axisLeft(y));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("t-SNE X");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .text("t-SNE Y");

      svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", d => d.ticker === selectedTicker ? 10 : 6)
        .style("fill", d => sectorColor[d.sector] || "gray")
        .style("stroke", d => d.ticker === selectedTicker ? "black" : "none")
        .style("stroke-width", d => d.ticker === selectedTicker ? 2 : 0)
        .on("mouseover", (event, d) => {
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.ticker}</strong><br/>Sector: ${d.sector}`);
        })
        .on("mousemove", event => {
          tooltip
            .style("top", `${event.offsetY + 12}px`)
            .style("left", `${event.offsetX + 20}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

      svg.selectAll(".label")
        .data(data.filter(d => d.ticker === selectedTicker))
        .enter()
        .append("text")
        .attr("x", d => x(d.x) + 12)
        .attr("y", d => y(d.y))
        .text(d => d.ticker)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "black");

      const legend = svg
        .append("g")
        .attr("transform", `translate(${width + 30}, 10)`);

      Object.entries(sectorColor).forEach(([sector, color], i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
        row.append("circle").attr("r", 6).attr("fill", color).attr("cy", 0);
        row
          .append("text")
          .text(sector)
          .attr("x", 12)
          .attr("y", 4)
          .style("font-size", "13px");
      });
    };

    drawChart();

    
    const handleResize = () => drawChart();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedTicker]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl shadow-md p-4 bg-white border border-gray-300 w-full"
    >
      <h2 className="text-lg font-semibold mb-2">t-SNE Projection</h2>
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  );
};

export default TSNEPlot;
