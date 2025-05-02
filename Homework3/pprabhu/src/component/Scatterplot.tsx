/**
 * This code builds off of existing code and uses parts from online D3 examples.
 * Source: options.tsx
 * Source: https://observablehq.com/@d3/scatterplot/2
 * Source: https://observablehq.com/@d3/zoomable-area-chart
 * Source: https://d3-graph-gallery.com/graph/custom_legend.html
 */

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from '../types';

interface StockDataPoint {
  stock: string;
  x: number;
  y: number;
  sector: string;
}

interface ScatterplotInterface {
  selectedStock: string;
}

const margin = { left: 50, right: 90, top: 25, bottom: 40 } as Margin;

export default function Scatterplot({ selectedStock }: ScatterplotInterface) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<StockDataPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const csvData = await d3.csv("../../data/tsne.csv");
        const parsedData = csvData.map((d) => ({
          stock: d.stock,
          x: +d.x,
          y: +d.y,
          sector: d.sector,
        }));
        setData(parsedData);
      } catch (error) {
        console.error("Issue in reading tsne.csv:", error);
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
            drawChart(svgRef.current!, data, width, height, selectedStock);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current!, data, width, height, selectedStock);
    }

    return () => resizeObserver.disconnect();
  }, [data]);

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="scatter-plot-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement: SVGSVGElement, data: StockDataPoint[], width: number, height: number, selectedStock: string) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove(); // clear previous render

  // Using D3 color scheme for sectors
  const sectors = Array.from(new Set(data.map(d => d.sector)));
  const colorScale = d3.scaleOrdinal<string>().domain(sectors).range(d3.schemeCategory10);

  // Additional variables for margins and padding for better layout
  const xExtent = d3.extent(data, d => d.x) as [number, number];
  const yExtent = d3.extent(data, d => d.y) as [number, number];
  const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
  const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

  //Prepare the scales for positional encoding
  const x = d3.scaleLinear()
    .domain([xExtent[0] - xPadding, xExtent[1] + xPadding]).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([yExtent[0] - yPadding, yExtent[1] + yPadding]).nice()
    .range([height - margin.bottom, margin.top]);

  // Modify the SVG container.
  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Prevents points from extending outside the chart area when zooming
  svg.append("defs").append("clipPath")
    .attr("id", "scatter-clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);

  const chartArea = svg.append("g").attr("clip-path", "url(#scatter-clip)");

  // Create the axes
  // X Axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80))
    .call(g => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.bottom - 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .text("t-SNE DIMENSION 1 →"));
  // Y Axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.append("text")
      .attr("x", -margin.left + 10)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("↑ t-SNE DIMENSION 2"));

  // Create the grid
  svg.append("g")
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
      .attr("x1", d => 0.5 + x(d))
      .attr("x2", d => 0.5 + x(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
      .attr("y1", d => 0.5 + y(d))
      .attr("y2", d => 0.5 + y(d))
      .attr("x1", margin.left)
      .attr("x2", width - margin.right));

  // Add a layer of dots
  const dots = chartArea.selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", d => d.stock === selectedStock ? 8 : 4)
    .attr("fill", d => colorScale(d.sector))
    .attr("stroke", d => d.stock === selectedStock ? "#000" : "none")
    .attr("stroke-width", d => d.stock === selectedStock ? 2 : 0)
    .attr("opacity", d => d.stock === selectedStock ? 1 : 0.7);

  // Add tooltip for points
  dots.append("title")
    .text(d => d.stock);

  // Add a layer of labels
  if (selectedStock) {
    const selected = data.find(d => d.stock === selectedStock);
    if (selected) {
      chartArea.append("text")
        .attr("x", x(selected.x) + 10)
        .attr("y", y(selected.y) - 10)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(selected.stock);
    }
  }

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 10}, ${margin.top + 10})`);

  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-weight", "bold")
    .style("font-size", "11px")
    .text("Sectors");

  sectors.forEach((sector, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale(sector));

    legendRow.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .text(sector);
  });

  // Zoom and Pan
  const zoom = d3.zoom()
    .scaleExtent([0.3, 10])
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(x);
      const newY = event.transform.rescaleY(y);

      // Update axes
      svg.select<SVGGElement>(".x-axis").transition().duration(200).call(d3.axisBottom(newX).ticks(width / 80));
      svg.select<SVGGElement>(".y-axis").transition().duration(200).call(d3.axisLeft(newY));

      // Update dot positions
      dots.attr("cx", d => newX(d.x))
        .attr("cy", d => newY(d.y));

      // Update label position for selected stock
      if (selectedStock) {
        const selected = data.find(d => d.stock === selectedStock);
        if (selected) {
          chartArea.select("text")
            .attr("x", newX(selected.x) + 10)
            .attr("y", newY(selected.y) - 10);
        }
      }
    });

  svg.call(zoom as any);

  // Small instruction text at the bottom
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 1)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "#888888")
    .text("Drag to pan, scroll to zoom")
}