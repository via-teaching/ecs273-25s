import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce, isEmpty } from "lodash";
import Papa from "papaparse";

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

const TsneScatter = ({ selectedStock }) => {
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
    fetch(`/data/tsne.csv`)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        const data = parsed.data.filter(d => d.x && d.y && d.sector && d.stock);
        if (!isEmpty(data)) {
          drawChart(svgRef.current, data, width, height, selectedStock);
        }
      });
  };

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default TsneScatter;

function drawChart(svgElement, data, width, height, selectedStock) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.x))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.y))
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  svg.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(+d.x))
    .attr("cy", d => yScale(+d.y))
    .attr("r", d => d.stock === selectedStock ? 10 : 5)
    .attr("fill", d => colorScale(d.sector))
    .attr("stroke", d => d.stock === selectedStock ? "black" : "none")
    .attr("stroke-width", d => d.stock === selectedStock ? 2 : 0);

  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

  const sectors = [...new Set(data.map(d => d.sector))];
  sectors.forEach((sector, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("rect").attr("width", 10).attr("height", 10).attr("fill", colorScale(sector));
    g.append("text").attr("x", 15).attr("y", 10).text(sector).style("font-size", "0.8rem");
  });
}
