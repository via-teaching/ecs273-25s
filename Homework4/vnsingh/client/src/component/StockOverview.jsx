import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce, isEmpty } from "lodash";

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
    console.log("📌 Fetching data for:", selectedStock);

    fetch(`http://localhost:8000/stock/${selectedStock}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Received data:", data);

        if (!data.stock_series || !Array.isArray(data.stock_series)) {
          console.error("❌ Invalid data format");
          return;
        }

        const parsed = data.stock_series.map(d => ({
          Date: d3.timeParse("%Y-%m-%d")(d.date.split(" ")[0]),
          Open: +d.Open,
          High: +d.High,
          Low: +d.Low,
          Close: +d.Close,
        }));

        if (!isEmpty(parsed)) {
          drawChart(svgRef.current, parsed, width, height);
        }
      })
      .catch(err => {
        console.error("❌ Error fetching stock data:", err);
      });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        overflowY: "hidden",
      }}
    >
      <svg ref={svgRef} style={{ width: "200%" }} height="100%"></svg>
    </div>
  );
};

export default StockOverview;

function drawChart(svgElement, data, width, height) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.Date))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => d.Low),
      d3.max(data, (d) => d.High),
    ])
    .range([height - margin.bottom, margin.top]);

  const line = (field) =>
    d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d[field]));

  // Axes
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  const colorMap = {
    Open: "blue",
    High: "red",
    Low: "green",
    Close: "orange"
  };

  ["Open", "High", "Low", "Close"].forEach((key) => {
    svg.append("path")
      .datum(data)
      .attr("class", `line-${key.toLowerCase()}`)
      .attr("fill", "none")
      .attr("stroke", colorMap[key])
      .attr("stroke-width", 1.5)
      .attr("d", line(key));
  });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

  Object.entries(colorMap).forEach(([label, color], i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("rect").attr("width", 10).attr("height", 10).attr("fill", color);
    g.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text(label)
      .style("font-size", "0.8rem");
  });

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(xScale);

      ["Open", "High", "Low", "Close"].forEach((key) => {
        const updatedLine = d3.line()
          .x(d => newX(d.Date))
          .y(d => yScale(d[key]));
        svg.select(`.line-${key.toLowerCase()}`)
          .attr("d", updatedLine(data));
      });

      svg.select(".x-axis").call(d3.axisBottom(newX));
    });

  svg.call(zoom);
}