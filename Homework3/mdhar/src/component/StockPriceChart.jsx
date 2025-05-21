import * as d3 from "d3";
import { useEffect, useRef } from "react";

function StockPriceChart({ selectedStock }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // clear previous render

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = svg.node().parentNode.getBoundingClientRect().width - margin.left - margin.right;  // dynamic width based on parent
    const height = 300 - margin.top - margin.bottom;  // set a fixed height, or adjust as needed

    const g = svg
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");

    d3.csv(`data/stockdata/${selectedStock}.csv`).then((data) => {
      console.log("Raw data:", data);

      data.forEach((d) => {
        d.Date = d3.isoParse(d.Date);
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
      });

      console.log("Parsed data:", data);

      data = data.filter(
        (d) =>
          !isNaN(d.Open) &&
          !isNaN(d.High) &&
          !isNaN(d.Low) &&
          !isNaN(d.Close)
      );

      if (data.length === 0) {
        console.error("No valid data loaded for stock:", selectedStock);
        return;
      }

      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.Date))
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => Math.min(d.Open, d.High, d.Low, d.Close)), d3.max(data, (d) => Math.max(d.Open, d.High, d.Low, d.Close))])
        .nice()
        .range([height, 0]);

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      const line = (key) =>
        d3
          .line()
          .x((d) => x(d.Date))
          .y((d) => y(d[key]));

      const colors = {
        Open: "steelblue",
        High: "green",
        Low: "red",
        Close: "orange",
      };

      const xAxisG = g
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

      g.append("g").call(yAxis);

      // add axis labels
      g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Date");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Stock Price (USD)");

      ["Open", "High", "Low", "Close"].forEach((key) => {
        g.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", colors[key])
          .attr("stroke-width", 1.5)
          .attr("d", line(key));
      });

      const legend = g.append("g").attr("transform", `translate(0,0)`);
      ["Open", "High", "Low", "Close"].forEach((key, i) => {
        const item = legend
          .append("g")
          .attr("transform", `translate(${i * 100}, -10)`);
        item.append("rect").attr("width", 10).attr("height", 10).attr("fill", colors[key]);
        item
          .append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(key)
          .attr("font-size", "12px")
          .attr("fill", "black");
      });

      const zoom = d3
        .zoom()
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

      svg.call(zoom);

      function zoomed(event) {
        const newX = event.transform.rescaleX(x);
        xAxisG.call(d3.axisBottom(newX));

        ["Open", "High", "Low", "Close"].forEach((key) => {
          g.selectAll("path.line")
            .filter((_, idx) => idx === ["Open", "High", "Low", "Close"].indexOf(key))
            .attr("d", d3.line().x((d) => newX(d.Date)).y((d) => y(d[key])));
        });
      }
    }).catch((error) => {
      console.error("Error loading CSV:", error);
    });
  }, [selectedStock]);

  return (
    <div style={{ overflowX: "auto", width: "100%" }}> {/* Adjust width to 100% */}
      <svg ref={ref}></svg>
    </div>
  );
}

export default StockPriceChart;
