import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {debounce } from 'lodash';

const margin = { left: 50, right: 20, top: 20, bottom: 60 };
  
export function LineChart({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            drawChart(svgRef.current, selectedStock, width, height); 
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current, selectedStock, width, height); 
    }

    return () => resizeObserver.disconnect();
  }, [ selectedStock]);

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%',overflowX: 'auto',overflowY: 'hidden'}}>
      <svg id="bar-svg" ref={svgRef}></svg>
    </div>
  );
}

async function drawChart(svgElement, _, width, height) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove(); 

  const selected = d3.select('#bar-select').property('value');
  const path = `../../data/stockdata/${selected}.csv`;
  const data = await d3.csv(path, d => ({
    date: new Date(d.Date),
    open: +d.Open,
    high: +d.High,
    low: +d.Low,
    close: +d.Close,
  }));

  const keys = ['open','high', 'low', 'close'];
  const colors = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.open, d.high, d.low, d.close)),
      d3.max(data, d => Math.max(d.open, d.high, d.low, d.close)),
    ])
    .range([height - margin.bottom, margin.top]);

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("class", "chart-group");

  // Clip path
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);

  // Line generators
  const lines = {};
  keys.forEach(key => {
    lines[key] = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d[key]));
  });

  keys.forEach(key => {
    g.append("path")
      .datum(data)
      .attr("class", `line-${key}`)
      .attr("fill", "none")
      .attr("stroke", colors(key))
      .attr("stroke-width", 1.5)
      .attr("clip-path", "url(#clip)")
      .attr("d", lines[key]);
  });

  const xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeMonth.every(1))
    .tickFormat(d3.timeFormat("%Y-%m-%d"));

  const xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-20)")
    .style("text-anchor", "end");

  const yAxisGroup = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  yAxisGroup.selectAll("text")
    .style("font-size", "8px")
    
  // Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height -10)
    .attr("text-anchor", "middle")
    .text("Date");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 + 15)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Price");

  // Legend
  const legend = svg.append("g")
  .attr("class", "legend-group")
  .attr("transform", `translate(${margin.left}, ${margin.top - 10})`);

  keys.forEach((key, i) => {
  const legendItem = legend.append("g")
    .attr("transform", `translate(${i * 100}, 0)`); 

  legendItem.append("rect")
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", colors(key));

  legendItem.append("text")
    .attr("x", 25)
    .attr("y", 6)
    .text(key)
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");
  });


  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .translateExtent([[margin.left, 0], [width + margin.left, height]])
    .extent([[margin.left, 0], [width + margin.left, height]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(xScale);

      keys.forEach(key => {
        const newLine = d3.line()
          .x(d => newX(d.date))
          .y(d => yScale(d[key]));
        g.select(`.line-${key}`).attr("d", newLine(data));
      });

      g.select(".x-axis").call(d3.axisBottom(newX)
        .ticks(d3.timeMonth.every(1))  
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
      )
      .selectAll("text")
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end");
    });

  svg.call(zoom);
}


