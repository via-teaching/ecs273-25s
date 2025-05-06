/**
 * This code uses parts of code from online D3 examples.
 * Source: options.tsx
 * Source: https://observablehq.com/@d3/line-chart/2
 * Source: https://observablehq.com/@d3/zoomable-area-chart
 * Source: https://d3-graph-gallery.com/graph/custom_legend.html
 */

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from '../types';

interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockLineChartInterface {
  selectedStock: string;
}

const margin = { left: 50, right: 90, top: 30, bottom: 30 } as Margin;

export default function StockLineChart({ selectedStock }: StockLineChartInterface) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const csvData = await d3.csv(`../../data/stockdata/${selectedStock}.csv`, d => ({
          date: new Date(d.Date || ""),
          open: +d.Open!,
          high: +d.High!,
          low: +d.Low!,
          close: +d.Close!,
        }));
        setData(csvData);
      } catch (error) {
        console.error("Issue in reading .csv stock data: ", error);
        setData([]);
      }
    }
    if (selectedStock) {
      fetchData();
    }
  }, [selectedStock]);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect as ComponentSize;
          if (width && height && !isEmpty(data)) {
            drawChart(svgRef.current!, data, width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current!, data, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [data]);

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="stock-line-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement: SVGSVGElement, data: StockData[], width: number, height: number) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove(); // clear previous render

  // Modify the SVG container.
  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "font: 12px sans-serif;");

  // X and Y scales
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date) as [Date, Date])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.open, d.high, d.low, d.close))! * 0.95,
      d3.max(data, d => Math.max(d.open, d.high, d.low, d.close))! * 1.05,
    ])
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 90))
    .call((g: any) => g.append("text")
      .attr("x", (width - margin.right + margin.left) / 2) 
      .attr("y", margin.bottom - 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle") 
      .attr("font-size", "12px")
      .text("DATE →"));

  // Y Axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(height / 20))
    .call((g: any) => g.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -((height) / 2)) 
      .attr("y", -margin.left + 15) 
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("PRICE ($)"));

  // Prevents lines from extending outside the chart area when zooming
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);

  const chartArea = svg.append("g").attr("clip-path", "url(#clip)");

  // Colors the lines
  const colors: Record<string, string> = { open: "#AA9139", high: "#338A2E", low: "#A8383B", close: "#383276" };

  // Line generator
  const line = (key: keyof StockData) =>
    d3.line<StockData>()
      .x(d => x(d.date))
      .y(d => y(d[key]));

  // Draw the lines
  ["open", "high", "low", "close"].forEach(key => {
    chartArea.append("path")
      .datum(data)
      .attr("class", `line ${key}`)
      .attr("fill", "none")
      .attr("stroke", colors[key])
      .attr("stroke-width", 1.5)
      .attr("d", line(key as keyof StockData));
  });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 10},${margin.top})`);

  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-weight", "bold")
    .style("font-size", "11px")
    .text("Stock Metric");

  Object.keys(colors).forEach((key, i) => {
    const group = legend.append("g")
      .attr("transform", `translate(0,${i * 20})`);

    group.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colors[key]);

    group.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .text(key.charAt(0).toUpperCase() + key.slice(1));
  });

  // Zoom and Scroll
  const zoom = d3.zoom()
    .scaleExtent([1, 100])
    .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(x);

      const visibleDomain = newX.domain();
      const visibleData = data.filter(d =>
        d.date >= visibleDomain[0] && d.date <= visibleDomain[1]);

      if (visibleData.length > 0) {
        const newYMin = d3.min(visibleData, d => Math.min(d.open, d.high, d.low, d.close))! * 0.95;
        const newYMax = d3.max(visibleData, d => Math.max(d.open, d.high, d.low, d.close))! * 1.05;

        y.domain([newYMin, newYMax]);

        // Update y-axis based on zoom
        svg.select<SVGGElement>(".y-axis")
          .transition()
          .duration(200)
          .call(d3.axisLeft(y).ticks(height / 20));
      }

      // Update x-axis based on zoom
      svg.select<SVGGElement>(".x-axis")
        .transition()
        .duration(200)
        .call(d3.axisBottom(newX).ticks(width / 90));

      // Update the location of the lines
      ["open", "high", "low", "close"].forEach(key => {
        chartArea.select(`.${key}`)
          .attr("d", d3.line<StockData>()
            .x(d => newX(d.date))
            .y(d => y(d[key as keyof StockData]))(data));
      });
    });

  // Capturing mouse events for zooming and panning
  svg.append("rect")
    .attr("class", "zoom-area")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .call(zoom as any);

  // Small instruction text at the bottom
  svg.append("text")
    .attr("x", (width - margin.right + margin.left) / 2)
    .attr("y", margin.top - 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#888888")
    .text("Drag to pan, scroll to zoom")
}
