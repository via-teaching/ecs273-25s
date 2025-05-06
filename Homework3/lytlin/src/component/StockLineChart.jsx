import * as d3 from "d3";
import { useEffect, useRef } from "react";

const margin = { left: 50, right: 20, top: 40, bottom: 60 };

export function StockLineChart({ stockSymbol }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!stockSymbol) return;

    const loadData = async () => {
      const response = await d3.csv(`/data/stockdata/${stockSymbol}.csv`, d3.autoType);
      response.sort((a, b) => a.Date - b.Date); 
      console.log(`Loaded data for ${stockSymbol}:`, response);
      drawChart(response);
    };

    loadData();
  }, [stockSymbol]);

  const drawChart = (data) => {
    if (!containerRef.current || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = containerRef.current.getBoundingClientRect();

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([margin.left, width - margin.right]);

    const yExtent = d3.extent(data.flatMap(d => [d.Open, d.High, d.Low, d.Close]));
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([height - margin.bottom, margin.top]);

    const clipId = "clip-path-area";
    svg.append("defs").append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const chartGroup = svg.append("g")
      .attr("clip-path", `url(#${clipId})`);

    const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`);

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0f")))
      .selectAll("text")
      .style("font-size", "10px")
      .style("text-anchor", "end")
      .attr("dx", "3");

    svg.selectAll(".tick text").style("font-size", "10px");

    const lineGen = (key) => d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d[key]));

    const colorMap = {
      Open: 'steelblue',
      High: 'green',
      Low: 'red',
      Close: 'orange'
    };

    const paths = {};
    Object.keys(colorMap).forEach(key => {
      paths[key] = chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[key])
        .attr("stroke-width", 1.5)
        .attr("d", lineGen(key));
    });

    xAxis.call(d3.axisBottom(xScale));

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, 0], [width - margin.right, height]])
      .extent([[margin.left, 0], [width - margin.right, height]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        xAxis.call(d3.axisBottom(newX));
        Object.keys(colorMap).forEach(key => {
          paths[key].attr("d", d3.line()
            .x(d => newX(d.Date))
            .y(d => yScale(d[key]))(data));
        });
      });

    svg.call(zoom);

    const legend = svg.selectAll(".legend")
      .data(Object.entries(colorMap))
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${width - 300  + i * 75}, ${margin.top - 25})`);

    legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d[1]);

    legend.append("text")
      .attr("x", 13)
      .attr("y", 10)
      .text(d => d[0]);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "1rem")
      .style("font-weight", "bold")
      .text(`Stock Price Overview: ${stockSymbol}`);


      
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "0.9rem")
    .text("Date");

    
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "0.9rem")
    .text("Price");

  };
   //search some info from AI
  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
