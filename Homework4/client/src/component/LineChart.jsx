import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { top: 20, right: 20, bottom: 40, left: 50 };


const colors = {
  Open: "steelblue",
  High: "green",
  Low: "red",
  Close: "orange",
};

export function LineChart({selectedTicker}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [stockData, setStockData] = useState([]);
  const parseDate = d3.timeParse("%Y-%m-%d") || d3.timeParse("%Y/%m/%d");

  useEffect(() => {
  if (!selectedTicker) return;

  fetch(`http://localhost:8000/stock/${selectedTicker}`)
    .then(res => res.json())
    .then(data => {
      setStockData(
        data.stock_series.map(d => ({
          date: parseDate(d.date),
          Open: +d.Open,
          High: +d.High,
          Low: +d.Low,
          Close: +d.Close,
          Volume: d.Volume !== undefined ? +d.Volume : undefined,
        }))
      );
    })
    .catch(err => {
      console.error("API loading error:", err);
      setStockData([]);
    });
}, [selectedTicker]);

  // Draw line chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stockData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    let x = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date))
      .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
      .domain([
        d3.min(stockData, d => Math.min(d.Open, d.High, d.Low, d.Close)),
        d3.max(stockData, d => Math.max(d.Open, d.High, d.Low, d.Close)),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const clipId = "clip";

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    // X axis title
    svg.append("text")
      .attr("class", "x axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .text("Date");

    // Y axis title
    svg.append("text")
      .attr("class", "y axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 15)
      .text("Price");

    const chart = svg.append("g").attr("clip-path", `url(#${clipId})`);

    const line = key =>
      d3.line()
        .x(d => x(d.date))
        .y(d => y(d[key]));

    Object.keys(colors).forEach(key => {
      chart.append("path")
        .datum(stockData)
        .attr("fill", "none")
        .attr("stroke", colors[key])
        .attr("stroke-width", 1.5)
        .attr("d", line(key));
    });

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));

    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    const tooltip = svg.append("g").style("display", "none");
    tooltip.append("line")
      .attr("class", "hover-line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom);
    const tooltipText = tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "-0.5em")
      .style("font-size", "12px");

    svg.on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event);
      const hoveredDate = x.invert(mouseX);
      const bisect = d3.bisector(d => d.date).left;
      const idx = bisect(stockData, hoveredDate);
      const d = stockData[idx];
      if (!d) return;
      tooltip.style("display", null);
      tooltip.select(".hover-line")
        .attr("x1", x(d.date))
        .attr("x2", x(d.date));
      const text = [
        d.date.toISOString().slice(0, 10),
        ...Object.keys(colors).map(k => `${k}: ${d[k]?.toFixed(2) ?? "N/A"}`)
      ].join(" | ");
      tooltipText
        .attr("x", x(d.date))
        .attr("y", margin.top + 5)
        .text(text);
    });

    svg.on("mouseleave", () => tooltip.style("display", "none"));

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const transform = event.transform;
        const newX = transform.rescaleX(x);
        const newY = transform.rescaleY(y);
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));
        Object.keys(colors).forEach(key => {
          chart.select(`path[stroke='${colors[key]}']`)
            .attr("d", d3.line()
              .x(d => newX(d.date))
              .y(d => newY(d[key])));
        });
      });

    svg.call(zoom);
  }, [stockData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", overflowX: "hidden" }}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
}