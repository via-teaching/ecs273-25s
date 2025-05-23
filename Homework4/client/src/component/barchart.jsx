import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';


const margin = { left: 40, right: 20, top: 20, bottom: 40};

export function BarChart({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;


    const handleResize = new ResizeObserver(
      debounce((entries) => {
        entries.forEach(entry => {
          if (entry.target === containerRef.current) {
            const { width, height } = entry.contentRect;
            if (width && height) {
            
              fetch(`http://localhost:8000/api/stocks/${selectedStock}/prices`)
                .then(response => response.json())
                .then(data => {
                  drawChart(svgRef.current, data.prices, width, height);
                })
                .catch(error => {
                  console.error('Failed to fetch price data:', error);
                });
            }
          }
        });
      }, 100)
    );

    handleResize.observe(containerRef.current);


    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      fetch(`http://localhost:8000/api/stocks/${selectedStock}/prices`)
        .then(response => response.json())
        .then(data => {
          drawChart(svgRef.current, data.prices, width, height);
        })
        .catch(error => {
          console.error('Failed to fetch price data:', error);
        });
    }

    return () => handleResize.disconnect();
  }, [selectedStock]);

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="price-chart" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement, rawData, width, height) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); 

   
    const data = rawData.map((d) => ({
        date: new Date(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
    }));

    //y axis
    const priceRange = d3.extent(
        data.flatMap(d => [d.open, d.high, d.low, d.close])
    );

    // x axis
    const timeScale = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.date));

    // y scale
    const priceScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain(priceRange);
    
    const chartGroup = svg.append("g");

    // y axis line
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(priceScale));

    // y label
    svg.append('g')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .text('Price')
        .style('font-size', '.8rem');

    // x label
    svg.append('g')
        .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top +12 })`)
        .append('text')
        .text('Date')
        .style('font-size', '.8rem'); 

    // stock type and color
    const priceTypes = [
        { key: "open", label: "Open", color: "blue" },
        { key: "high", label: "High", color: "green" },
        { key: "low", label: "Low", color: "orange" },
        { key: "close", label: "Close", color: "red" },
    ];
    
    // plot lines
    priceTypes.forEach(({ key, color }, index) => {
        const priceLine = d3.line()
            .x((d) => timeScale(d.date))
            .y((d) => priceScale(d[key]));
    
        chartGroup.append("path")
            .datum(data)
            .attr("class", `price-line-${index}`) 
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("d", priceLine);
    });

    // legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 5 }, ${height - margin.bottom - 20})`);

    priceTypes.forEach(({ label, color }, index) => {
        const legendGroup = legend.append("g")
            .attr("transform", `translate(${index * 50},0)`);

        
        legendGroup.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color);

   
        legendGroup.append("text")
            .attr("x", 16)
            .attr("y", 10)
            .style("font-size", "0.65rem")
            .attr("fill", color) 
            .text(label);
    });

 
    svg.append("text")
        .attr("class", "hint")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom + 30)
        .style("text-anchor", "end")
        .style("font-size", "0.75rem")
        .style("fill", "#666")
        .text("drag: scroll, wheel/pinch: zoom");

    // zoom
    const clipId = "clip-" + Date.now();
    svg.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

    chartGroup.attr("clip-path", `url(#${clipId})`);


    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(timeScale));


    const baseTimeScale = timeScale.copy();

    const zoom = d3.zoom()
        .scaleExtent([1, 20])  // ズームの範囲を1-20倍に制限
        .extent([[margin.left, 0], [width - margin.right, 0]])
        .on("zoom", handleZoom);

    svg.call(zoom);


    function handleZoom(event) {
        const newTimeScale = event.transform.rescaleX(baseTimeScale);
        xAxis.call(d3.axisBottom(newTimeScale));

 
        priceTypes.forEach(({ key }, index) => {
            const updatedLine = d3.line()
                .x(d => newTimeScale(d.date))
                .y(d => priceScale(d[key]));

            svg.select(`.price-line-${index}`)
                .attr("d", updatedLine);
        });
    }
}

