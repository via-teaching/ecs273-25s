import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';


const margin = { left: 45, right: 20, top: 5, bottom: 33 };
  
export function LineChart(selectedStock) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const filepath = "../../data/stockdata/" + selectedStock.selectedStock + ".csv"
      try {
      const csvData = await d3.csv(filepath, d => {
        return {date: new Date(d.Date), open: +d.Open, high: +d.High, low: +d.Low, close: +d.Close, volume: +d.Volume};
      });
        setLines(csvData);
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    fetchData();
  }, [selectedStock]);


  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height && (lines.length != 0)) {
            drawChart(containerRef, svgRef.current, lines, width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height && (lines.length != 0)) {
      drawChart(containerRef, svgRef.current, lines, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [lines]);
  

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: "100%", height: "100%", overflowX: "auto" }}>
      <svg id="line-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(containerRef, svgElement, lines, width, height ) {

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const yMin = d3.min(lines.map((d) => d.low))
    const yMax = d3.max(lines.map((d) => d.high))
    const xExtents = d3.extent(lines, d => d.date)

    
    const x = d3.scaleTime()
      .domain(xExtents)
      .range([margin.left, width - margin.right - 50]);

    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);
   
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .text('Date')
      .style('font-size', '12px');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -(height-margin.top-25) / 2)
      .attr('y', 15)
      .text('Price')
      .style('font-size', '12px');
  
  svg.attr("width",width*2).attr("height", height);
  const chartArea = svg.append("g")
    .attr("class", "chart-area");

  const xAxisGroup = chartArea.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`);
  const yAxisGroup = chartArea.append("g")
    .attr("transform", `translate(${margin.left}, 0)`);

  xAxisGroup.call(d3.axisBottom(x));
  yAxisGroup.call(d3.axisLeft(y));
      
  const metrics = [
    { key: "open", color: "#007bff" },
    { key: "close", color: "#28a745" },
    { key: "high", color: "#ffc107" },
    { key: "low", color: "#dc3545" }
  ];

  const linesGroup = chartArea.append("g");

  function renderLines(xScale) {
    linesGroup.selectAll("path").remove();
    metrics.forEach(({ key, color }) => {
      const lineGenerator = d3.line()
        .x((d) => xScale(d.date))
        .y((d) => y(d[key]));

      linesGroup.append("path")
        .datum(lines)
        .attr("class", key)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.2)
        .attr("d", lineGenerator);
    });
  }

  renderLines(x);

  const legend = svg.selectAll(".legend")
    .data(metrics)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (_, i) => `translate(0, ${i * 20})`);

  legend.append("rect")
    .attr("x", 100)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d) => d.color);

  legend.append("text")
    .attr("x", 94)
    .attr("y", 5)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => d.key);

  containerRef.current.addEventListener("scroll", function () {
    const scrollLeft = containerRef.current.scrollLeft;
    chartArea.attr("transform", `translate(${ -scrollLeft }, 0)`);
  });

  const baseWidth = width;
  let currentZoomScale = 1;

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", (event) => {
      currentZoomScale = event.transform.k;
      const zoomedWidth = baseWidth * currentZoomScale;

      const newX = d3.scaleTime()
        .domain(x.domain())
        .range([margin.left, zoomedWidth - margin.right]);

      svg.attr("width", zoomedWidth);

      xAxisGroup.call(d3.axisBottom(newX));
      renderLines(newX);
    });

  svg.call(zoom);
}