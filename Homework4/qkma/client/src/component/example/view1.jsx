import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

const margin = { left: 40, right: 20, top: 20, bottom: 35 };

export function LineChart({ stock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [stockData, setStockData] = useState([]);

  // Get stock data from database
  useEffect(() => {
    if (stock) {
      fetch(`http://localhost:8000/stock/${stock}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.Date && data.Date.length) {
            const parsed = data.Date.map((dateStr, i) => ({
              date: new Date(dateStr),
              open: data.Open[i],
              high: data.High[i],
              low: data.Low[i],
              close: data.Close[i],
            }));
            setStockData(parsed);
          } else {
            setStockData([]);
          }
        })
        .catch((err) => {
          console.error(err);
          setStockData([]);
        });
    }
  }, [stock]);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || stockData.length === 0) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            drawChart(svgRef.current, stockData, width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current, stockData, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [stockData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        border: "1px solid #ccc",
      }}
    >
      <svg ref={svgRef} height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement, data, outsideWidth, outsideHeight) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const zoomBaseWidth = outsideWidth;
  let currentZoom = 1;

  svg.attr("width", zoomBaseWidth);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, zoomBaseWidth - margin.right]);

  const yMax = d3.max(data, (d) => Math.max(d.open, d.high, d.low, d.close));
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([outsideHeight - margin.bottom, margin.top]);

  const fields = [
    { field: "open", color: "rgb(219, 32, 101)" },
    { field: "high", color: "rgb(0, 173, 75)" },
    { field: "low", color: "rgb(254, 190, 40)" },
    { field: "close", color: "#4400f2" },
  ];

  const g = svg.append("g").attr("class", "chart-content");

  const xAxisG = g
    .append("g")
    .attr("transform", `translate(0,${outsideHeight - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  const yAxisG = g
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  fields.forEach((d) => {
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", d.color)
      .attr("stroke-width", 1.5)
      .attr("class", `line-${d.field}`)
      .attr(
        "d",
        d3
          .line()
          .x((p) => xScale(p.date))
          .y((p) => yScale(p[d.field]))
      );
  });

  // Legend
  fields.forEach((item, i) => {
    svg.append("rect")
      .attr("x", outsideWidth - 110)
      .attr("y", outsideHeight - margin.bottom - 90 + i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", item.color);

    svg.append("text")
      .attr("x", outsideWidth - 90)
      .attr("y", outsideHeight - margin.bottom - 80 + i * 20)
      .attr("fill", "black")
      .style("font-size", "12px")
      .text(item.field);
  });
  svg.append("text")
    .attr("x", outsideWidth / 2)
    .attr("y", outsideHeight - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Time");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -outsideHeight / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Price");

  // Zoom
  svg.call(
    d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        currentZoom = event.transform.k;
        const newWidth = zoomBaseWidth * currentZoom;
        svg.attr("width", newWidth);

        const newXScale = event.transform.rescaleX(xScale);
        const newYScale = event.transform.rescaleY(yScale);

        xAxisG.call(d3.axisBottom(newXScale));
        yAxisG.call(d3.axisLeft(newYScale));

        fields.forEach((d) => {
          g.select(`.line-${d.field}`).attr(
            "d",
            d3
              .line()
              .x((p) => newXScale(p.date))
              .y((p) => newYScale(p[d.field]))
          );
        });

        fields.forEach((item, i) => {
          g.selectAll("rect")
            .filter((_, idx) => idx === i)
            .attr("x", newWidth - 100);
          g.selectAll("text")
            .filter((_, idx) => idx === i)
            .attr("x", newWidth - 85);
        });
      })
  );
}
