import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { debounce } from 'lodash';

const stocks = [
    'NVDA', 'AAPL', 'XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'JPM', 'GS', 'BAC', 'MSFT', 'GOOGL', 'META'
];


const margin = { left: 80, right: 40, top: 20, bottom: 60 };

export function LineChart({ selectedTicker }) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [bars, setBars] = useState([]);
    
    // useEffect(() => {
    //   if (!containerRef.current || !svgRef.current) return;
  
    //   // Load the selected stock data from CSV
    //   fetch(`http://localhost:8000/stock/${selectedTicker}`)
    //   .then(res => res.json())
    //   .then(data => {
    //   // Assuming your data document has a field like `data` or similar with the array of price records
    //   console.log("Fetched data:", data);
    //   setBars(data.data); // or adjust to your actual field name
    // });
  
    //   const resizeObserver = new ResizeObserver(
    //     debounce((entries) => {
    //       for (const entry of entries) {
    //         if (entry.target !== containerRef.current) continue;
    //         const { width, height } = entry.contentRect;
    //         if (width && height && bars.length > 0) {
    //           drawChart(svgRef.current, bars, width, height);
    //         }
    //       }
    //     }, 100)
    //   );
  
    //   resizeObserver.observe(containerRef.current);
  
    //   // Initial chart render based on starting size
    //   const { width, height } = containerRef.current.getBoundingClientRect();
    //   if (width && height) {
    //     drawChart(svgRef.current, bars, width, height);
    //   }
  
    //   return () => resizeObserver.disconnect();
    // }, [selectedTicker, bars]);  // Trigger useEffect when selectedTicker or bars change

    useEffect(() => {
      if (!selectedTicker) return;
      fetch(`http://localhost:8000/stock/${selectedTicker}`)
        .then(res => res.json())
        .then(data => {
          console.log("Fetched data:", data);
          setBars(data.data);
        });
    }, [selectedTicker]);
    

    useEffect(() => {
      if (!containerRef.current || !svgRef.current || bars.length === 0) return;
    
      const resizeObserver = new ResizeObserver(
        debounce((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width && height) {
              console.log("Drawing chart on resize", width, height);
              drawChart(svgRef.current, bars, width, height);
            }
          }
        }, 100)
      );
    
      resizeObserver.observe(containerRef.current);
    
      // Initial draw
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width && height) {
        console.log("Initial draw", width, height);
        drawChart(svgRef.current, bars, width, height);
      }
    
      return () => resizeObserver.disconnect();
    }, [bars]);
  
    return (
      <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <svg id="line-svg" ref={svgRef} width="100%" height="100%"></svg>
      </div>
    );
  }
  

function drawChart(svgElement, bars, width, height) {
  console.log("Drawing chart with bars:", bars);
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove(); // Clear previous render

  bars.forEach(d => {
    d.date = new Date(d.date);
  });
  console.log(bars[0].date); // should now show a valid Date object


  const xScale = d3.scaleTime()
    .range([margin.left, width - margin.right])
    .domain(d3.extent(bars, (d) => d.date));

  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([0, d3.max(bars, (d) => Math.max(d.Open, d.High, d.Low, d.Close))]);

  const line = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.Close));

  const lineOpen = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.Open));

  const lineHigh = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.High));

  const lineLow = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.Low));

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  svg.append('g')
    .append('text')
    .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
    .text('Price')
    .style('font-size', '.8rem');

  svg.append('g')
    .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
    .append('text')
    .text('Date')
    .style('font-size', '.8rem');

  // Draw the lines for Open, High, Low, and Close
  svg.append('path')
    .data([bars])
    .join('path')
    .attr('class', 'line')
    .attr('d', lineOpen)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');
  
  svg.append('path')
    .data([bars])
    .join('path')
    .attr('class', 'line')
    .attr('d', lineHigh)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');
  
  svg.append('path')
    .data([bars])
    .join('path')
    .attr('class', 'line')
    .attr('d', lineLow)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');
  
  svg.append('path')
    .data([bars])
    .join('path')
    .attr('class', 'line')
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', 'teal')
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');

  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 150}, ${margin.top})`);

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'green');
  legend.append('text')
    .attr('x', 15)
    .attr('y', 10)
    .text('Open');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 20)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'blue');
  legend.append('text')
    .attr('x', 15)
    .attr('y', 30)
    .text('High');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 40)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'red');
  legend.append('text')
    .attr('x', 15)
    .attr('y', 50)
    .text('Low');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 60)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'teal');
  legend.append('text')
    .attr('x', 15)
    .attr('y', 70)
    .text('Close');
  
  svg.append("circle")
    .attr("cx", xScale(bars[0].date))
    .attr("cy", yScale(bars[0].Close))
    .attr("r", 5)
    .attr("fill", "red");

    const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[margin.left, 0], [width - margin.right, height]])
    .on("zoom", (event) => {
      const { transform } = event;
      xScale.range([margin.left, width - margin.right].map(d => transform.applyX(d)));
      svg.selectAll('.line').attr('d', (d) => line(d));
      svg.select('.x-axis').call(d3.axisBottom(xScale));
    });

  svg.call(zoom);
}
