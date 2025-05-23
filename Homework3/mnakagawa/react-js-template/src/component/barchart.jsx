import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';
import Data from "../../data/demo.json";


const margin = { left: 40, right: 20, top: 20, bottom: 40 };
  
export function BarChart({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
//   const bars = Data.data;

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            d3.csv(`/data/stockdata/${selectedStock}.csv`).then((rawData) => {
                drawChart(svgRef.current,rawData, width, height);
            });
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
        d3.csv(`/data/stockdata/${selectedStock}.csv`).then((rawData) => {
            drawChart(svgRef.current,rawData, width, height);
        });
    }

    return () => resizeObserver.disconnect();
  }, [selectedStock]);

  

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="bar-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}


function drawChart(svgElement, rawData, width, height) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // clear previous render

    const stock_data = rawData.map((d) => ({
        Date: new Date(d.Date),
        Open: +d.Open,
        High: +d.High,
        Low: +d.Low,
        Close: +d.Close,
    }));

    const yExtent = d3.extent(stock_data.flatMap(d => [d.Open, d.High, d.Low, d.Close]));
    // const xCategories = [...new Set(bars.map((d) => d.category))];

    const xScale = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(d3.extent(stock_data, d => d.Date));

    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain(yExtent);
    
    const g = svg.append("g");

    //View1: labeled axes
    
    //axes

    //delete original x axis for new x-axis with Zoom function
    // svg.append('g')
    //     .attr('transform', `translate(0, ${height - margin.bottom})`)
    //     .call(d3.axisBottom(xScale))

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // labels
    svg.append('g')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .text('Price')
        .style('font-size', '.8rem');

    svg.append('g')
        .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top +12 })`)
        .append('text')
        .text('Date')
        .style('font-size', '.8rem'); 
    

    const fields = [
        { key: "Open", color: "blue" },
        { key: "High", color: "green" },
        { key: "Low", color: "orange" },
        { key: "Close", color: "red" },
        ];
    
    fields.forEach(({ key, color }, idx) => {
        const line = d3.line()
            .x((d) => xScale(d.Date))
            .y((d) => yScale(d[key]));
    
        g.append("path")
            .datum(stock_data)
            .attr("class", `line-${idx}`) 
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("d", line);
    });


    // View 1: legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 5 }, ${height - margin.bottom - 20})`);

    fields.forEach(({ key, color }, i) => {
        const g = legend.append("g").attr("transform", `translate(${i * 50},0)`);
        g.append("rect")
            .attr("width", 10).attr("height", 10)
            .attr("fill", color);
        g.append("text")
            .attr("x", 16).attr("y", 10)
            .style("font-size", "0.65rem")
            .attr("fill", color) 
            .text(key);
    });


    svg.append("text")
        .attr("class", "hint-text")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom + 30)
        .style("text-anchor", "end")
        .style("font-size", "0.75rem")
        .style("fill", "#666")
        .text("drag: horizontal scroll, wheel/pinch: zoom");


    // View 1: Zoom and scroll
    const clipId = "clipID-" + Math.random().toString(36).slice(2);
    svg.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

    g.attr("clip-path", `url(#${clipId})`);


    const new_g = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));


    const xScale_original = xScale.copy();

    const dataMinPx = xScale(stock_data[0].Date);
    const dataMaxPx = xScale(stock_data[stock_data.length - 1].Date);

    const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[margin.left, 0],[dataMaxPx, 0]])
        .extent([[margin.left, 0], [width - margin.right, 0]])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const newX = event.transform.rescaleX(xScale_original);
        new_g.call(d3.axisBottom(newX));

        fields.forEach(({ key, color }, idx) => {
            const newLine = d3.line()
                .x(d => newX(d.Date))
                .y(d => yScale(d[key]));

            svg.select(`.line-${idx}`)
                .attr("d", newLine);
        });
    }

}

