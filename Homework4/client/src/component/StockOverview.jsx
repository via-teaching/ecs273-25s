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
    const url = `http://localhost:8000/stock/${selectedStock}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const data = json.stock_series
          .filter((d) => d.date && d.Open && d.High && d.Low && d.Close)
          .map((d) => ({
            Date: d3.timeParse("%Y-%m-%d")(d.date),
            Open: +d.Open,
            High: +d.High,
            Low: +d.Low,
            Close: +d.Close,
          }));

        if (!isEmpty(data)) {
          drawChart(svgRef.current, data, width, height);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch stock data:", err);
      });
  };

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
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
    .nice()
    .range([height - margin.bottom, margin.top]);

  const lineGen = (key) => d3.line()
    .x((d) => xScale(d.Date))
    .y((d) => yScale(d[key]));

  const gContent = svg.append("g").attr("class", "content");

  gContent.append("path").datum(data).attr("d", lineGen("Open"))
    .attr("stroke", "blue").attr("fill", "none").attr("stroke-width", 1.5);
  gContent.append("path").datum(data).attr("d", lineGen("High"))
    .attr("stroke", "red").attr("fill", "none").attr("stroke-width", 1.5);
  gContent.append("path").datum(data).attr("d", lineGen("Low"))
    .attr("stroke", "green").attr("fill", "none").attr("stroke-width", 1.5);
  gContent.append("path").datum(data).attr("d", lineGen("Close"))
    .attr("stroke", "orange").attr("fill", "none").attr("stroke-width", 1.5);

  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  const legendItems = [
    { label: "Open", color: "blue" },
    { label: "High", color: "red" },
    { label: "Low", color: "green" },
    { label: "Close", color: "orange" },
  ];
  const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  legendItems.forEach((item, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("line").attr("x1", 0).attr("x2", 20).attr("y1", 5).attr("y2", 5)
      .attr("stroke", item.color).attr("stroke-width", 2);
    g.append("text").attr("x", 25).attr("y", 9).text(item.label).style("font-size", "0.8rem");
  });

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[margin.left, 0], [width - margin.right, height]])
    .extent([[margin.left, 0], [width - margin.right, height]])
    .on("zoom", (event) => {
      const t = event.transform;
      const newX = t.rescaleX(xScale);

      gContent.selectAll("path").attr("d", (d, i, nodes) => {
        const key = ["Open", "High", "Low", "Close"][i];
        return d3.line()
          .x((d) => newX(d.Date))
          .y((d) => yScale(d[key]))(data);
      });

      xAxis.call(d3.axisBottom(newX));
    });

  svg.call(zoom);
}
