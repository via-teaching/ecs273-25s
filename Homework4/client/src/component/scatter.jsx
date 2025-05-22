import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';



const margin = { left: 45, right: 20, top: 5, bottom: 33 };
  
export function Scatter({selectedStock, TSNE}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!TSNE || TSNE.length === 0) return;

    setPoints(TSNE)
  }, [selectedStock, TSNE]);


  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height && (points.length != 0) && selectedStock !== undefined) {
            drawChart(containerRef, svgRef.current, points, width, height, selectedStock);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height && (points.length != 0) && selectedStock !== undefined) {
      drawChart(containerRef, svgRef.current, points, width, height, selectedStock.selectedStock);
    }

    return () => resizeObserver.disconnect();
  }, [points]);
  

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: "100%", height: "100%"}}>
      <svg id="scatter-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(containerRef, svgElement, points, width, height, selectedStock) {


  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();


  const classes = Array.from(new Set(points.map(d => d.type)));
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(classes);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(points, d => d.x)).nice()
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(points, d => d.y)).nice()
    .range([height - margin.bottom, margin.top]);


  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("class", "x axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .text("X");

    svg.append("text")
      .attr("class", "y axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 15)
      .text("Y");

  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  const container = svg.append("g").attr("class", "container");

  const gx = svg.append("g").call(xAxis);
  const gy = svg.append("g").call(yAxis);

  const plotArea = container.append("g").attr("class", "plot-area");

  const circles = plotArea.selectAll("circle")
    .data(points)
    .join("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", d => d.ticker == selectedStock ? 7 : 6)
    .attr("fill", d => color(d.type))
    .attr("stroke", d => d.ticker == selectedStock ? "black" : "none")
    .attr("stroke-width", d => d.ticker == selectedStock ? 3 : 0);

  const labels = plotArea.selectAll("text.label")
    .data(points)
    .join("text")
    .attr("class", "label")
    .attr("x", d => xScale(d.x) + 7)
    .attr("y", d => yScale(d.y) - 5)
    .text(d => d.ticker)
    .style("font-size", "10px")
    .style("font-weight", d => d.ticker == selectedStock ? "bold" : "normal");

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

  classes.forEach((cls, i) => {
    const legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 20})`);
      
  legendRow.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", color(cls));

  legendRow.append("text")
    .attr("x", 18)
    .attr("y", 10)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(cls);
    })

  function zoomed(event) {
    const transform = event.transform;

    const zx = transform.rescaleX(xScale);
    const zy = transform.rescaleY(yScale);

    gx.call(d3.axisBottom(zx));
    gy.call(d3.axisLeft(zy));

    circles
      .attr("cx", d => zx(d.x))
      .attr("cy", d => zy(d.y));

    labels
      .attr("x", d => zx(d.x) + 7)
      .attr("y", d => zy(d.y) - 5);
      }

  svg.call(zoom);
  }

export default Scatter;