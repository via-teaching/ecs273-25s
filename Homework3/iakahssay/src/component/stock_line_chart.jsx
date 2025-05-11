import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { left: 40, right: 20, top: 20, bottom: 30  };

export function StockLineChart({ selectedStock }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!selectedStock) console.log("Didn't get any stocks"); {/*return;*/}

    d3.csv(`/data/stockdata/${selectedStock}.csv`, d3.autoType)
      .then((raw) => {
        console.log(`Loaded ${selectedStock}.csv`, raw);  // 🔍 Log the loaded data

        const parsed = raw.map(d => ({
          date: new Date(d.Date),  // explicitly convert string to Date
          open: d.Open,
          high: d.High,
          low: d.Low,
          close: d.Close,
        }));
  
        setData(parsed);
      });
  }, [selectedStock]);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;
  
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
  
    const { width, height } = containerRef.current.getBoundingClientRect();
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, innerWidth]);
  
    const minY = d3.min(data, d => d.low);
    const maxY = d3.max(data, d => d.high);
    const padding = (maxY - minY) * 0.1;
  
    const yScale = d3.scaleLinear()
      .domain([minY - padding, maxY + padding])
      .range([innerHeight, 0])
      .nice();
  
    const chartArea = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    const xAxis = chartArea.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));
  
    const yAxis = chartArea.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));
  
    // Line generator
    const drawLine = (accessor, color) => {
      chartArea.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("class", "line-path")
        .attr("d", d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(accessor(d)))
        );
    };
  
    drawLine(d => d.open, "steelblue");
    drawLine(d => d.high, "green");
    drawLine(d => d.low, "red");
    drawLine(d => d.close, "orange");
  
    // Legend
    const legend = chartArea.append("g").attr("transform", "translate(0, -10)");
    const labels = ["Open", "High", "Low", "Close"];
    const colors = ["steelblue", "green", "red", "orange"];
  
    labels.forEach((label, i) => {
      legend.append("rect")
        .attr("x", i * 80 + 12)
        .attr("width", 10)
        .attr("y", 0)
        .attr("height", 10)
        .attr("fill", colors[i]);
  
      legend.append("text")
        .attr("x", i * 80 + 25)
        .attr("y", 10)
        .attr("font-size", "0.8rem")
        .text(label);
    });
  
    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.7rem")
      .text(`${selectedStock} Date`);
  
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - height / 2 + 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.7rem")
      .text("Stock Value (USD)");
  
    // Zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        xAxis.call(d3.axisBottom(newX));
  
        chartArea.selectAll(".line-path")
          .attr("d", (d, i) => {
            const accessor = [d => d.open, d => d.high, d => d.low, d => d.close][i];
            return d3.line()
              .x(d => newX(d.date))
              .y(d => yScale(accessor(d)))(data);
          });
      });
  
    svg.call(zoom);
  }, [data]);
  

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}