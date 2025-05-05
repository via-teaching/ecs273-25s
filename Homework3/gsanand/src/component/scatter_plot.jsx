import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { csv } from "d3-fetch";

export function TsnePlot() {
  const svgRef = useRef();

  useEffect(() => {
    const dropdown = document.getElementById("bar-select");

    const loadAndRender = async () => {
      const data = await csv("data/tsne.csv");

      // Wait until dropdown is populated
      let ticker = document.getElementById("bar-select")?.value;
      if (!ticker) {
        await new Promise(resolve => setTimeout(resolve, 100));
        ticker = document.getElementById("bar-select")?.value;
      }

      render(data, ticker);
    };

    loadAndRender();

    const handler = () => loadAndRender();
    dropdown?.addEventListener("change", handler);
    return () => dropdown?.removeEventListener("change", handler);
  }, []);

  const render = (data, selectedTicker) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 1100;
    const height = 650;

    svg.attr("viewBox", [0, 0, width, height]);

    const x = d3.scaleLinear(d3.extent(data, d => +d.x), [40, width - 40]);
    const y = d3.scaleLinear(d3.extent(data, d => +d.y), [height - 40, 40]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const sectors = Array.from(new Set(data.map(d => d.Sector)));
    color.domain(sectors);

    // Clip path to prevent overflowing
    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 35)
      .attr("y", 5)
      .attr("width", width - 60)
      .attr("height", height - 40);

    const main = svg.append("g")
      .attr("clip-path", "url(#clip)");

    const xAxis = d3.axisBottom(x).ticks(6);
    const yAxis = d3.axisLeft(y).ticks(6);

    const gX = svg.append("g")
      .attr("transform", `translate(0,${height - 40})`)
      .attr("class", "x-axis")
      .call(xAxis);

    const gY = svg.append("g")
      .attr("transform", `translate(40,0)`)
      .attr("class", "y-axis")
      .call(yAxis);

    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text("t-SNE X");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .text("t-SNE Y");

    const drawPoints = (xScale, yScale) => {
      main.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(+d.x))
        .attr("cy", d => yScale(+d.y))
        .attr("r", d => d.Ticker === selectedTicker ? 14 : 10)
        .attr("fill", d => color(d.Sector))
        .attr("stroke", d => d.Ticker === selectedTicker ? "black" : null)
        .attr("stroke-width", d => d.Ticker === selectedTicker ? 1.5 : 0);

      // Ticker label
      main.selectAll("text.ticker-label")
        .data(data.filter(d => d.Ticker === selectedTicker))
        .join("text")
        .attr("class", "ticker-label")
        .attr("x", d => xScale(+d.x) + 15)
        .attr("y", d => yScale(+d.y) + 4)
        .text(d => d.Ticker)
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
    };

    drawPoints(x, y);

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);
        gX.call(d3.axisBottom(newX));
        gY.call(d3.axisLeft(newY));
        drawPoints(newX, newY);
      });

    svg.call(zoom);

    // Auto-center selected ticker
    if (selectedTicker) {
      const point = data.find(d => d.Ticker === selectedTicker);
      if (point) {
        const tx = x(+point.x);
        const ty = y(+point.y);
        const zoomTransform = d3.zoomIdentity
          .translate(width / 2 - tx * 2, height / 2 - ty * 2)
          .scale(2);

        svg.transition()
          .duration(500)
          .call(zoom.transform, zoomTransform);
      }
    }

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 110}, 20)`);
    sectors.forEach((sector, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 18)
        .attr("r", 5)
        .attr("fill", color(sector));
      legend.append("text")
        .attr("x", 10)
        .attr("y", i * 18 + 5)
        .text(sector)
        .attr("font-size", "11px")
        .attr("alignment-baseline", "middle");
    });
  };

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
