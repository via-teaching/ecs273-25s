import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { left: 40, right: 20, top: 20, bottom: 60  };

export function StockLineChart({ selectedStock }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!selectedStock) window.print("Didn't get any stocks"); {/*return;*/}

    d3.csv(`/data/stockdata/${selectedStock}.csv`, d3.autoType)
      .then((raw) => {
        const parsed = raw.map(d => ({
          date: new Date(d.Date),
          open: +d.Open,
          high: +d.High,
          low: +d.Low,
          close: +d.Close,
        }));
        setData(parsed);
      });
  }, [selectedStock]);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) window.print("Error with data, svg, or containerRef"); {/*return;*/}

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = containerRef.current.getBoundingClientRect();
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    const line = (accessor, color) => {
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(accessor(d)))
        );
    };

    line(d => d.open, "steelblue");
    line(d => d.high, "green");
    line(d => d.low, "red");
    line(d => d.close, "orange");

    // Legend
    const legend = g.append("g").attr("transform", "translate(0,0)");
    const labels = ["Open", "High", "Low", "Close"];
    const colors = ["steelblue", "green", "red", "orange"];

    labels.forEach((label, i) => {
      legend.append("rect")
        .attr("x", i * 80)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colors[i]);

      legend.append("text")
        .attr("x", i * 80 + 15)
        .attr("y", 10)
        .attr("font-size", "0.8rem")
        .text(label);
    });

  }, [data]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}