import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';
import Data from "../../data/demo.json";

// im hardcodeing the tickers rather tahn creating data.json file since prof mentioned in class to student this is fine
const tickers = [ 
  'XOM', 'CVX', 'HAL',
  'MMM', 'CAT', 'DAL',
  'MCD', 'NKE', 'KO',
  'JNJ', 'PFE', 'UNH',
  'JPM', 'BAC', 'GS',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

const margin = { left: 50, right: 80, top: 25, bottom: 60 };
  
export function Figure1_linechart() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // there was a bug where when you select a stock, only the latest figure gets updated
  // meanoing when i fininshed the code for figure 2, figure 1 would not sync with the selected stock feature
  // when i finsihed code for figure 3, figure 1 and 2 would not load
  // meaning the latest one called in App.jsx is hte one that gets updated
  // after googleing/debugging/asking llm follow up questions given my error & the hard to understand google results, 
  // i was able to implement somethign that updates the stock throguhout all 3 files, regardless of latest one
  // (so it doesnt overwrite, because earlier all 3 figures were callign the filter event)
  const curr_stock_selected = useRef('');

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
  
    const filter_stock_selected = d3.select('#bar-select');
    const curr_stock = filter_stock_selected.property('value');
  
    curr_stock_selected.current = curr_stock;
    sync_data_to_chart(curr_stock);
  
    const handleSelectChange = function(event) {
      const gotten_stock_val = event.target.value;
      curr_stock_selected.current = gotten_stock_val;
      sync_data_to_chart(gotten_stock_val);
    };
  
    filter_stock_selected.on('change.figure1', handleSelectChange);
  
    return () => {
      filter_stock_selected.on('change.figure1', null);
    };
  }, []);
  


  // Make the line chart synced w most recent selectede data
  const sync_data_to_chart = (stock) => {
    
    const stock_data_csv_path = `../data/stockdata/${stock}.csv`;
    
    d3.csv(stock_data_csv_path).then(data => {
      // i used documentaton + llm + w3schools  to learn how to sift thru csv in d3
      const data_from_csv = data.map(d => ({
        date: new Date(d.Date),
        open: d.Open,
        high: d.High,
        low: d.Low,
        close: d.Close
      }))
      // sort it 
      data_from_csv.sort((a, b) => a.date - b.date);
      
      const resizeObserver = new ResizeObserver(
        debounce((entries) => {
          for (const entry of entries) {
            if (entry.target !== containerRef.current) continue;
            const { width, height } = entry.contentRect;
            if (width && height && !isEmpty(data_from_csv)) {
              drawChart(svgRef.current, data_from_csv, stock, width, height);
            }
          }
        }, 100)
      );
      
      resizeObserver.observe(containerRef.current);
      
      // Draw initially based on starting size
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width && height) {
        drawChart(svgRef.current, data_from_csv, stock, width, height);
      }
      
      return () => resizeObserver.disconnect();
    });
  };

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="line-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

// draws the chart
function drawChart(svgElement, data, curr_stock, width, height) {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove(); // clear previous render
    
  // this gives the MAX and MIN of the field
  const xExtent = d3.extent(data, d => d.date);
  const yMax = d3.max(data, d => Math.max(d.open, d.high, d.low, d.close));
  const yMin = d3.min(data, d => Math.min(d.open, d.high, d.low, d.close));
  const yPadding = (yMax - yMin) * 0.1; 
  
  // x axis time scale
  const xScale = d3.scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(xExtent);
    
  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([yMin - yPadding, yMax + yPadding]);
  
  // Make sure lines dont go out of bounds
  svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("x", margin.left)
    .attr("y", margin.top);
  
  const linechart_group = svg.append("g")
    .attr("clip-path", "url(#clip)");
  
  // ===============================================================
  // the 4 lines
  const line1_OPEN = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.open))
    .curve(d3.curveBumpX);
  
  const line2_HIGH = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.high))
    .curve(d3.curveBumpX);
  
  const line3_LOW = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.low))
    .curve(d3.curveBumpX);
  
  const line4_CLOSE = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.close))
    .curve(d3.curveBumpX);
  
  // ===============================================================
  // color the lines
  
  // Blue for open
  linechart_group.append("path")
    .datum(data)
    .attr("class", "line open-line")
    .attr("fill", "none")
    .attr("stroke", "#4285F4")  
    .attr("stroke-width", 1.5)
    .attr("d", line1_OPEN);
    
  // Green for high
  linechart_group.append("path")
    .datum(data)
    .attr("class", "line high-line")
    .attr("fill", "none")
    .attr("stroke", "#0F9D58")  
    .attr("stroke-width", 1.5)
    .attr("d", line2_HIGH);
    
  // Red for low
  linechart_group.append("path")
    .datum(data)
    .attr("class", "line low-line")
    .attr("fill", "none")
    .attr("stroke", "#DB4437")  
    .attr("stroke-width", 1.5)
    .attr("d", line3_LOW);
    
  // Black for close
  linechart_group.append("path")
    .datum(data)
    .attr("class", "line close-line")
    .attr("fill", "none")
    .attr("stroke", "#000000")  
    .attr("stroke-width", 1.5)
    .attr("d", line4_CLOSE);
    
  // ===============================================================
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(width > 800 ? 8 : 5));  // Reduced ticks for less crowding
  
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).ticks(7).tickFormat(d => `$${d.toFixed(0)}`));  // Simplified dollar format
  
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom + 40})`)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Date");
  
  svg.append("text")
    .attr("transform", `translate(${margin.left / 3}, ${height / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("$ Price $");

  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${margin.top / 2})`)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${curr_stock} Stock Price Line Chart`);
  
  const legend_mapiings = [
    { label: "Open", color: "#4285F4" },
    { label: "High", color: "#0F9D58" },
    { label: "Low", color: "#DB4437" },
    { label: "Close", color: "#000000" }
  ];
  
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
  
  legend_mapiings.forEach((d, i) => {
    const legendItem = legend.append("g")
    .style("font-weight", "bold")
      .attr("transform", `translate(0, ${i * 15})`);
      
    
    legendItem.append("line")
      .attr("x1", 0)
      .attr("y1", 5)
      .attr("x2", 15)
      .attr("y2", 5)
      .attr("stroke", d.color)
      .attr("stroke-width", 2);
    
    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 9)
      .text(d.label);
  });
  
  // allow zooming
  // used documentation+llm+w3schools to help w scaling and zoom
  // const zoom = d3.zoom()
  //   .scaleExtent([1, 10])
  //   .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
  //   .on("zoom", zoomed);

  const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoomed);  // You don't need .extent() unless you want to limit panning area

  
    function zoomed(event) {
      const newXScale = event.transform.rescaleX(xScale);
      const newYScale = event.transform.rescaleY(yScale); // add this
    
      svg.select(".x-axis").call(d3.axisBottom(newXScale).ticks(width > 800 ? 8 : 5));
      svg.select(".y-axis").call(d3.axisLeft(newYScale).ticks(7).tickFormat(d => `$${d.toFixed(0)}`));
    
      const updateLine = (lineGenerator, accessorX, accessorY) =>
        lineGenerator
          .x(d => newXScale(accessorX(d)))
          .y(d => newYScale(accessorY(d)))
          .curve(d3.curveBumpX);
    
      linechart_group.select(".open-line")
        .attr("d", updateLine(d3.line(), d => d.date, d => d.open)(data));
      
      linechart_group.select(".high-line")
        .attr("d", updateLine(d3.line(), d => d.date, d => d.high)(data));
      
      linechart_group.select(".low-line")
        .attr("d", updateLine(d3.line(), d => d.date, d => d.low)(data));
      
      linechart_group.select(".close-line")
        .attr("d", updateLine(d3.line(), d => d.date, d => d.close)(data));
    }
      
  svg.call(zoom);
}