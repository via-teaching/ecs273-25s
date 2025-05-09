import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { top: 20, right: 20, bottom: 40, left: 50 };


const colors = {
  Open: "steelblue",
  High: "green",
  Low: "red",
  Close: "orange",
};

export function LineChart({selectedTicker}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [stockData, setStockData] = useState([]);
  const parseDate = d3.timeParse("%Y-%m-%d") || d3.timeParse("%Y/%m/%d");


  useEffect(() => {
    if (!selectedTicker) return; 
    const filePath = `/data/stockdata/${selectedTicker}.csv`;

    d3.csv(filePath, d => ({
      date: parseDate(d.Date),
      Open: +d.Open,
      High: +d.High,
      Low: +d.Low,
      Close: +d.Close,
      Volume: +d.Volume,
    })).then(data => {
      setStockData(data);
    }).catch(err => {
      console.error("CSV loading error:", err);
      setStockData([]);
    });
  }, [selectedTicker]);

  // Draw line chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stockData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const x = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date))
      .range([margin.left, width  - margin.right]); 

    const y = d3.scaleLinear()
      .domain([
        d3.min(stockData, d => Math.min(d.Open, d.High, d.Low, d.Close)),
        d3.max(stockData, d => Math.max(d.Open, d.High, d.Low, d.Close))
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width * 2, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    svg.call(zoom);

    const chart = svg.append("g").attr("clip-path", "url(#clip)");

    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

      const line = key =>
        d3.line()
          .x(d => {
            const xValue = x(d.date);
            if (isNaN(xValue)) console.error("Invalid x value for date:", d.date);
            return xValue;
          })
          .y(d => {
            const yValue = y(d[key]);
            if (isNaN(yValue)) console.error(`Invalid y value for key ${key}:`, d[key]);
            return yValue;
          });

    Object.keys(colors).forEach(key => {
      chart.append("path")
        .datum(stockData)
        .attr("fill", "none")
        .attr("stroke", colors[key])
        .attr("stroke-width", 1.5)
        .attr("d", line(key));
    });

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 150}, 20)`);
    Object.entries(colors).forEach(([key, color], i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect").attr("width", 10).attr("height", 10).attr("fill", color);
      g.append("text").attr("x", 15).attr("y", 10).text(key).style("font-size", "12px");
    });

    function zoomed(event) {
      const newX = event.transform.rescaleX(x);
      svg.select(".x-axis").call(d3.axisBottom(newX));

      Object.keys(colors).forEach(key => {
        chart.select(`path[stroke='${colors[key]}']`)
          .attr("d", d3.line()
            .x(d => newX(d.date))
            .y(d => y(d[key]))
          );
      });
    }
  }, [stockData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", overflowX: "hidden" }}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
}
