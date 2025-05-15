import * as d3 from "d3";
import { useEffect, useRef } from "react";

function TSNEScatter({ selectedStock }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 200, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const base = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = base
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("data/tsne.csv").then(data => {
      data.forEach(d => {
        d.x = +d.Dim1;
        d.y = +d.Dim2;
        d.Ticker = d.Ticker;
        d.Category = d.Category;
      });

      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x)).nice()
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y)).nice()
        .range([height, 0]);

      const categories = Array.from(new Set(data.map(d => d.Category)));
      const color = d3.scaleOrdinal()
        .domain(categories)
        .range(d3.schemeCategory10);

      // axes
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      const xAxisGroup = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

      const yAxisGroup = g.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      // axis labels
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("TSNE Dimension 1");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("TSNE Dimension 2");

      // zoom group
      const zoomGroup = g.append("g").attr("class", "zoom-group");

      // dots
      zoomGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", d => d.Ticker === selectedStock ? 6 : 3)
        .attr("fill", d => color(d.Category))
        .attr("stroke", d => d.Ticker === selectedStock ? "black" : "none")
        .attr("stroke-width", 1.5);

      // label selected stock
      const highlight = data.find(d => d.Ticker === selectedStock);
      if (highlight) {
        zoomGroup.append("text")
          .attr("x", x(highlight.x) + 8)
          .attr("y", y(highlight.y) - 8)
          .text(highlight.Ticker)
          .attr("font-size", "12px")
          .attr("fill", "black");
      }

      // legend
      const legend = base.append("g")
        .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

      categories.forEach((cat, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);

        row.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(cat));

        row.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .attr("font-size", "12px")
          .text(cat.replace(/_/g, " "));
      });

      // zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
          // apply the zoom transformation to the zoomGroup (scatter plot dots)
          zoomGroup.attr("transform", event.transform);

          // rescale the axes based on the zoom level
          const newX = event.transform.rescaleX(x);
          const newY = event.transform.rescaleY(y);

          // update the axes with the new scales
          xAxisGroup.call(d3.axisBottom(newX));
          yAxisGroup.call(d3.axisLeft(newY));
        });

      svg.call(zoom);
    });
  }, [selectedStock]);

  return <svg ref={ref}></svg>;
}

export default TSNEScatter;
