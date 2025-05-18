import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function TsnePlot() {
  const svgRef = useRef();

  useEffect(() => {
    const dropdown = document.getElementById("bar-select");

    const loadAndRender = async () => {
      const tickersRes = await fetch("http://localhost:8000/stock_list");
      const { tickers } = await tickersRes.json();

      let selected = dropdown?.value;
      if (!selected && dropdown) {
        dropdown.value = tickers[0];
        selected = tickers[0];
      }

      const all = await Promise.allSettled(
        tickers.map(async (ticker) => {
          const res = await fetch(`http://localhost:8000/tsne?stock_name=${ticker}`);
          if (!res.ok) return null;
          const json = await res.json();
          return {
            Ticker: json.Stock,
            Sector: json.Sector,
            x: json.x,
            y: json.y,
          };
        })
      );

      const data = all
        .filter((d) => d.status === "fulfilled" && d.value)
        .map((d) => d.value);

      render(data, selected);
    };

    // Initial and event-based render
    loadAndRender();
    dropdown?.addEventListener("change", loadAndRender);
    return () => dropdown?.removeEventListener("change", loadAndRender);
  }, []);

  const render = (data, selectedTicker) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1100;
    const height = 650;
    svg.attr("viewBox", [0, 0, width, height]);

    const x = d3.scaleLinear(d3.extent(data, d => +d.x), [40, width - 40]);
    const y = d3.scaleLinear(d3.extent(data, d => +d.y), [height - 40, 40]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.Sector))])
      .range([
        "#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231",
        "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe",
        "#008080", "#e6beff", "#aa6e28", "#fffac8", "#800000",
        "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080"
      ]);

    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 35)
      .attr("y", 5)
      .attr("width", width - 60)
      .attr("height", height - 40);

    const main = svg.append("g").attr("clip-path", "url(#clip)");

    const xAxis = d3.axisBottom(x).ticks(6);
    const yAxis = d3.axisLeft(y).ticks(6);

    const gX = svg.append("g")
      .attr("transform", `translate(0,${height - 40})`)
      .call(xAxis);

    const gY = svg.append("g")
      .attr("transform", `translate(40,0)`)
      .call(yAxis);

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

    const legend = svg.append("g").attr("transform", `translate(${width - 110}, 20)`);
    [...new Set(data.map(d => d.Sector))].forEach((sector, i) => {
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
