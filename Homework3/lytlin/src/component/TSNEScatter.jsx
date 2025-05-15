import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TSNEScatter({ selectedSymbol }) {
  const containerRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    d3.csv("/data/tsne.csv", d3.autoType).then(data => {
      draw(data);
    });
  }, [selectedSymbol]);

  const draw = (data) => {
    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 30, bottom: 100, left: 50 };

    const xExtent = d3.extent(data, d => d.X);
    const yExtent = d3.extent(data, d => d.Y);

    let xScale = d3.scaleLinear()
      .domain([xExtent[0] - 5, xExtent[1] + 5])
      .range([margin.left, width - margin.right]);

    let yScale = d3.scaleLinear()
      .domain([yExtent[0] - 5, yExtent[1] + 5])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10)
      .domain([...new Set(data.map(d => d.Sector))]);

    const g = svg.append("g").attr("class", "plot-group");

    const gx = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    const gy = g.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    const tooltip = d3.select(container)
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("font-size", "0.8rem")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    const drawDots = (x, y) => {
      g.selectAll("circle").remove();
      g.selectAll("text.symbol-label").remove();

      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.X))
        .attr("cy", d => y(d.Y))
        .attr("r", d => d.Symbol === selectedSymbol ? 8 : 4)
        .attr("fill", d => colorScale(d.Sector))
        .attr("stroke", d => d.Symbol === selectedSymbol ? "black" : "none")
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).style("cursor", "pointer");
          tooltip.style("visibility", "visible")
                 .html(`<strong>${d.Symbol}</strong><br/>Sector: ${d.Sector}`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.offsetY + 10) + "px")
                 .style("left", (event.offsetX + 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

      g.selectAll("text.symbol-label")
        .data(data.filter(d => d.Symbol === selectedSymbol))
        .enter()
        .append("text")
        .attr("x", d => x(d.X) + 10)
        .attr("y", d => y(d.Y))
        .attr("class", "symbol-label")
        .text(d => d.Symbol)
        .style("font-size", "0.8rem")
        .style("font-weight", "bold");
    };

    drawDots(xScale, yScale);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        const transform = event.transform;
        const zx = transform.rescaleX(xScale);
        const zy = transform.rescaleY(yScale);
        gx.call(d3.axisBottom(zx));
        gy.call(d3.axisLeft(zy));
        drawDots(zx, zy);
      });

    svg.call(zoom);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "1rem")
      .style("font-weight", "bold")
      .text("t-SNE Projection of Stock Latent Features");

    svg.append("text")
      .attr("x", container.clientWidth / 2)
      .attr("y", container.clientHeight - 55)
      .attr("text-anchor", "middle")
      .style("font-size", "0.9rem")
      .text("t-SNE Dimension 1");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -container.clientHeight / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "0.9rem")
      .text("t-SNE Dimension 2");

    const legend = g.selectAll(".legend")
      .data(colorScale.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(-10, ${margin.top + 100 + i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", colorScale);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d);
  };
  //search some info from AI
  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
