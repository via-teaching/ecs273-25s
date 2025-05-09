import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce, isEmpty } from "lodash";
import Papa from "papaparse";

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

const StockOverview = ({ selectedStock }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            fetchAndDraw(width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      fetchAndDraw(width, height);
    }

    return () => resizeObserver.disconnect();
  }, [selectedStock]);

  const fetchAndDraw = (width, height) => {
    fetch(`/data/stockdata/${selectedStock}.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });  
        const data = parsed.data
          .filter((d) => d.Date && d.Open && d.High && d.Low && d.Close)
          .map((d) => ({
            Date: d3.timeParse("%Y-%m-%d")(d.Date.split(' ')[0]), 
            Open: +d.Open,
            High: +d.High,
            Low: +d.Low,
            Close: +d.Close,
          }));

        if (!isEmpty(data)) {
          drawChart(svgRef.current, data, width, height);
        }
      });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",  // Allow horizontal scrolling
        overflowY: "hidden", // Hide vertical scroll
      }}
    >
      <svg ref={svgRef} style={{ width: "200%" }} height="100%"></svg>  {/* Adjust width for scrolling */}
    </div>
  );
};

export default StockOverview;

function drawChart(svgElement, data, width, height) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const xScaleOriginal = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.Date))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => d.Low),
      d3.max(data, (d) => d.High),
    ])
    .range([height - margin.bottom, margin.top]);

  const lineOpen = d3.line()
    .x((d) => xScaleOriginal(d.Date))
    .y((d) => yScale(d.Open));

  const lineHigh = d3.line()
    .x((d) => xScaleOriginal(d.Date))
    .y((d) => yScale(d.High));

  const lineLow = d3.line()
    .x((d) => xScaleOriginal(d.Date))
    .y((d) => yScale(d.Low));

  const lineClose = d3.line()
    .x((d) => xScaleOriginal(d.Date))
    .y((d) => yScale(d.Close));

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScaleOriginal));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", lineOpen);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", lineHigh);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.5)
    .attr("d", lineLow);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("d", lineClose);

  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

  const legendItems = [
    { label: "Open", color: "blue" },
    { label: "High", color: "red" },
    { label: "Low", color: "green" },
    { label: "Close", color: "orange" },
  ];

  legendItems.forEach((item, index) => {
    const g = legend.append("g").attr("transform", `translate(0, ${index * 20})`);
    g.append("rect").attr("width", 10).attr("height", 10).attr("fill", item.color);
    g.append("text").attr("x", 15).attr("y", 10).text(item.label).style("font-size", "0.8rem");
  });

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const newXScale = event.transform.rescaleX(xScaleOriginal);
      svg.selectAll("path").attr("d", function(d) {
        return lineOpen(d); // update other lines accordingly
      });
      svg.select(".x-axis").call(d3.axisBottom(newXScale));
    });

  svg.call(zoom);
}
