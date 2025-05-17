import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface ScatterPlotProps {
  selectedStock: string;
}

interface TSNEDataPoint {
  ticker: string;
  sector: string;
  x: number;
  y: number;
};

const sectors = [
  "Energy", "Energy", "Energy",
  "Industrials", "Industrials", "Industrials",
  "Consumer", "Consumer", "Consumer",
  "Healthcare", "Healthcare", "Healthcare",
  "Financials", "Financials", "Financials",
  "Tech", "Tech", "Tech", "Tech", "Tech"
];

const margin = { top: 20, right: 20, bottom: 60, left: 40 };

export function ScatterPlot({ selectedStock }: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const apiUrl = `http://localhost:8000/tsne/`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch t-SNE data");
        return response.json();
      })
      .then(json => {
        const data: TSNEDataPoint[] = json.map((d: any,i:number) => ({
        ticker: d.Stock,
        sector: sectors[i] || "Unknown",
        x: +d.x,
        y: +d.y
        }));
        drawScatter(svgRef.current!, data, selectedStock, width, height);
      })
      .catch(console.error);
    }, [selectedStock]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

function drawScatter(
  svgElement: SVGSVGElement,
  data: TSNEDataPoint[],
  selectedStock: string,
  width: number,
  height: number
): void {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const color = d3.scaleOrdinal<string>()
    .domain(Array.from(new Set(data.map(d => d.sector))))
    .range(d3.schemeCategory10);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x) as [number, number])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y) as [number, number])
    .range([height - margin.bottom, margin.top]);

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const dataGroup = svg.append("g").attr("class", "data-layer");

  const xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  const yAxisGroup = svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .text("t-SNE X");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("t-SNE Y");

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 5])
    .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("zoom", (event) => {
      const transform = event.transform;
      const newXScale = transform.rescaleX(xScale);
      const newYScale = transform.rescaleY(yScale);

      xAxisGroup.call(d3.axisBottom(newXScale));
      yAxisGroup.call(d3.axisLeft(newYScale));

      dataGroup.selectAll<SVGCircleElement, TSNEDataPoint>("circle")
        .attr("cx", d => newXScale(d.x))
        .attr("cy", d => newYScale(d.y))
        .attr("display", d => {
          const cx = newXScale(d.x);
          const cy = newYScale(d.y);
          return (
            cx < margin.left || cx > width - margin.right ||
            cy < margin.top || cy > height - margin.bottom
          ) ? "none" : "inline";
        })
        .attr("r", d => (d.ticker === selectedStock ? 6 : 3) * transform.k);

      dataGroup.selectAll<SVGTextElement, TSNEDataPoint>("text")
        .attr("x", d => newXScale(d.x) + 5 * transform.k)
        .attr("y", d => newYScale(d.y) - 5 * transform.k)
        .attr("display", d => {
          const cx = newXScale(d.x);
          const cy = newYScale(d.y);
          return (
            cx < margin.left || cx > width - margin.right ||
            cy < margin.top || cy > height - margin.bottom
          ) ? "none" : "inline";
        })
        .style("font-size", `${12 * transform.k}px`);
    });

  svg.call(zoom);

  dataGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", d => d.ticker === selectedStock ? 6 : 3)
    .attr("fill", d => color(d.sector))
    .attr("stroke", d => d.ticker === selectedStock ? "black" : "none")
    .attr("stroke-width", 1.5);

  dataGroup.selectAll("text")
    .data(data.filter(d => d.ticker === selectedStock))
    .enter()
    .append("text")
    .attr("x", d => xScale(d.x) + 5)
    .attr("y", d => yScale(d.y) - 5)
    .text(d => d.ticker)
    .style("font-size", "12px");

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100}, ${margin.top})`);

  Array.from(new Set(data.map(d => d.sector))).forEach((sector, i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    row.append("rect").attr("width", 10).attr("height", 10).attr("fill", color(sector));
    row.append("text").attr("x", 15).attr("y", 10).text(sector).style("font-size", "12px");
  });
}
