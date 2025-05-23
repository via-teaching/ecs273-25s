import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TSNEData {
  TSNE1: number;
  TSNE2: number;
  Category: string;
  Ticker: string;
}

interface ScatterPlotProps {
  selectedTicker: string; // Selected ticker passed as a prop
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ selectedTicker }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchDataAndRenderChart = async () => {
      const data: TSNEData[] = await d3.csv("/data/tsne.csv", (d) => ({
        TSNE1: +d.TSNE1!,
        TSNE2: +d.TSNE2!,
        Category: d.Category!,
        Ticker: d.Ticker!,
      }));

      if (!svgRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const margin = { top: 20, right: 30, bottom: 70, left: 50 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous chart

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.TSNE1) as [number, number])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.TSNE2) as [number, number])
        .range([height, 0]);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add axes
      const xAxisGroup = chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      const yAxisGroup = chart.append("g").call(d3.axisLeft(yScale));

      // Add axis labels
      svg
        .append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + width / 2)
        .attr("y", containerHeight - 10)
        .text("TSNE1");

      svg
        .append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -containerHeight / 2)
        .attr("y", 15)
        .text("TSNE2");

      // Add points
      const points = chart
        .selectAll(".point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d) => xScale(d.TSNE1))
        .attr("cy", (d) => yScale(d.TSNE2))
        .attr("r", (d) => (d.Ticker === selectedTicker ? 10 : 5)) // Highlight selected ticker
        .attr("fill", (d) => colorScale(d.Category) as string)
        .attr("opacity", 0.8);

      // Add labels for selected ticker
      chart
        .selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => xScale(d.TSNE1) + 10)
        .attr("y", (d) => yScale(d.TSNE2))
        .text((d) => (d.Ticker === selectedTicker ? d.Ticker : "")) // Show label for selected ticker
        .attr("font-size", "10px")
        .attr("fill", "black");

      // Add legend
      const categories = Array.from(new Set(data.map((d) => d.Category)));
      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left}, ${height + margin.top + 40})` // Position below the chart
        );

      categories.forEach((category, index) => {
        const legendRow = legend
          .append("g")
          .attr("transform", `translate(${index * 100}, 0)`); // Space between legend items

        // Add color box
        legendRow
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", colorScale(category) as string);

        // Add text
        legendRow
          .append("text")
          .attr("x", 15)
          .attr("y", 10)
          .attr("text-anchor", "start")
          .attr("font-size", "12px")
          .text(category);
      });

      // Add zoom functionality
      const zoom = d3
        .zoom()
        .scaleExtent([1, 5]) // Allow zooming between 1x and 10x
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", (event) => {
          const transform = event.transform;
          const newXScale = transform.rescaleX(xScale);
          const newYScale = transform.rescaleY(yScale);

          // Update axes
          xAxisGroup.call(d3.axisBottom(newXScale));
          yAxisGroup.call(d3.axisLeft(newYScale));

          // Update points
          points
            .attr("cx", (d) => newXScale(d.TSNE1))
            .attr("cy", (d) => newYScale(d.TSNE2));

          // Update labels
          chart
            .selectAll<SVGTextElement, TSNEData>(".label")
            .attr("x", (d) => newXScale(d.TSNE1) + 10)
            .attr("y", (d) => newYScale(d.TSNE2));
        });

      svg.call(zoom as unknown as (selection: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void);
    };

    fetchDataAndRenderChart();
  }, [selectedTicker]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default ScatterPlot;