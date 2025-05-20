import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { top: 40, right: 20, bottom: 60, left: 60 };

export function TSNEScatterPlot({ selectedStock }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!selectedStock) {
      setData([]);
      return;
  }

    // Fetch t-SNE data from FastAPI
    fetch(`http://localhost:8000/tsne_data/?Ticker=${selectedStock}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("[ERROR] Failed to fetch t-SNE data");
        }
        return res.json();
      })
      .then((tsneData) => {
        if (!tsneData || !Array.isArray(tsneData)) {
          console.warn("[ERROR] Invalid or missing t-SNE data");
          setData([]);
          return;
        }

        // Expecting tsnePoint.AllStocks to be like:
        // [{ Ticker: 'AAPL', Dim1: 0.5, Dim2: -1.2, Category: 'Tech' }, ...]
        const formatted = tsneData.map((d) => ({
          ticker: d.Ticker,
          x: +d.Dim1,
          y: +d.Dim2,
          category: d.Category,
        }));

        setData(formatted);
      })
      .catch((err) => {
        console.error("[ERROR] Error fetching t-SNE data:", err);
        setData([]);
      });
  }, [selectedStock]);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = containerRef.current.getBoundingClientRect();
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const categories = Array.from(new Set(data.map(d => d.category)));
    colorScale.domain(categories);

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xAxis = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    const yAxis = g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    const points = g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", d => d.ticker === selectedStock ? 6 : 3)
      .attr("fill", d => colorScale(d.category))
      .attr("stroke", d => d.ticker === selectedStock ? "black" : "none")
      .attr("stroke-width", 1.5);

    // Label the selected stock
    g.selectAll("text.stock-label")
      .data(data.filter(d => d.ticker === selectedStock))
      .join("text")
      .attr("class", "stock-label")
      .attr("x", d => xScale(d.x) + 8)
      .attr("y", d => yScale(d.y) - 8)
      .text(d => d.ticker)
      .style("font-size", "0.8rem")
      .style("fill", "black");

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, 20)`);

    categories.forEach((cat, i) => {
      legend.append("rect")
        .attr("x", i * 155 - 53)
        .attr("y", -10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(cat));

      legend.append("text")
        .attr("x", i * 155 - 40)
        .attr("y", -10)
        .attr("dy", "0.75em")
        .text(cat)
        .style("font-size", "0.75rem");
    });

    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.8rem")
      .text("t-SNE Dimension 1");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.8rem")
      .text("t-SNE Dimension 2");

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        points
          .attr("cx", d => newX(d.x))
          .attr("cy", d => newY(d.y));

        g.selectAll("text.stock-label")
          .attr("x", d => newX(d.x) + 8)
          .attr("y", d => newY(d.y) - 8);
      });

    svg.call(zoom);
  }, [data, selectedStock]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}
