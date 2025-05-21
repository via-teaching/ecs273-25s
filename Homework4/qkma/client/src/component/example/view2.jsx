import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

// Get stock now and stock list from App
export function ScatterPlot({ stock ,tickers }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [data, setData] = useState([]);

  // Get tsne from database
  useEffect(() => {
    async function fetchTSNE() {
      try {
        const responses = await Promise.all(
          tickers.map(ticker =>
            fetch(`http://localhost:8000/tsne/?stock_name=${ticker.toUpperCase()}`)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`Fetch failed for ${ticker}: ${res.statusText}`);
                }
                return res.json();
              })
          )
        );


        const enriched = responses.map(d => ({
          tsne_x: +d.x,
          tsne_y: +d.y,
          stock_name: d.Stock || "unknown",
          category: d.Category || "Unknown"
        }));

        setData(enriched);
      } catch (error) {
        console.error("Failed to fetch t-SNE data:", error);
      }
    }

    fetchTSNE();
  }, [tickers]);

  useEffect(() => {
    console.log("Rendering chart with stock:", stock);
    if (!data.length) {
      console.warn("No data to render.");
      return;
    }

    if (!containerRef.current || !svgRef.current) {
      console.warn("Refs not ready.");
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();
    console.log("Container size:", { width, height });

    if (width < 100 || height < 100) {
      console.warn("Container too small to render chart.");
      return;
    }

    const matchedStock = data.find(d => d.stock_name === stock);
    if (!matchedStock) {
      console.warn(`Stock ${stock} not found in data`);
    } else {
      console.log("Highlighting stock data:", matchedStock);
    }

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.tsne_x) - 10, d3.max(data, d => d.tsne_x) + 10])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.tsne_y) - 20, d3.max(data, d => d.tsne_y) + 20])
      .range([height - margin.bottom, margin.top]);

    const g = svg.append("g");

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.tsne_x))
      .attr("cy", d => yScale(d.tsne_y))
      .attr("r", d => (d.stock_name === stock ? 8 : 5))
      .attr("fill", d => {
        if (d.category === 'Energy') return 'rgb(77, 241, 82)';
        if (d.category === 'Industrials') return '#ffc562';
        if (d.category === 'Consumer Discretionary/Staples') return 'rgb(176, 79, 221)';
        if (d.category === 'Healthcare') return '#ff6d74';
        if (d.category === 'Financials') return 'rgb(68, 158, 237)';
        if (d.category === 'Information Tech/Comm.Sec') return 'rgb(7, 126, 71)';
        return 'gray';
      })
      .attr("stroke", d => d.stock_name === stock ? "black" : "none")
      .attr("stroke-width", 1.5);

    g.selectAll(".label")
      .data(data.filter(d => d.stock_name === stock))
      .enter()
      .append("text")
      .attr("x", d => xScale(d.tsne_x))
      .attr("y", d => yScale(d.tsne_y) + 20)
      .text(d => d.stock_name.toUpperCase())
      .attr("font-size", 12)
      .attr("fill", "black")
      .classed("label", true);

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Dim1 X")
      .attr("font-size", 12);

    g.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Dim2 Y")
      .attr("font-size", 12);

    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`);
    const yAxisGroup = g.append("g")
      .attr("transform", `translate(${margin.left}, 0)`);

    xAxisGroup.call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));

    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);
        g.selectAll("circle")
          .attr("cx", d => newX(d.tsne_x))
          .attr("cy", d => newY(d.tsne_y));
        g.selectAll(".label")
          .attr("x", d => newX(d.tsne_x))
          .attr("y", d => newY(d.tsne_y) + 20);
        xAxisGroup.call(d3.axisBottom(newX));
        yAxisGroup.call(d3.axisLeft(newY));
      });

    svg.call(zoom);

    const categories = ['Energy', 'Industrials', 'Consumer Discretionary/Staples', 'Healthcare', 'Financials', 'Information Tech/Comm.Sec'];
    const colors = ['rgb(77, 241, 82)', '#ffc562', 'rgb(176, 79, 221)', '#ff6d74', 'rgb(68, 158, 237)', 'rgb(7, 126, 71)'];

    categories.forEach((cat, i) => {
      svg.append("rect")
        .attr("x", width - 220)
        .attr("y", height - i * 20 - 90)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colors[i]);
      svg.append("text")
        .attr("x", width - 200)
        .attr("y", height - i * 20 - 80)
        .text(cat)
        .attr("font-size", 12)
        .attr("fill", "black");
    });
  }, [data, stock]);

  return (
    <div
      ref={containerRef}
      className="chart-container"
      style={{
        width: "100%",
        height: "100%",
        minWidth: 400,
        minHeight: 300,
        position: "relative",
        border: "1px solid lightgray"
      }}
    >
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
