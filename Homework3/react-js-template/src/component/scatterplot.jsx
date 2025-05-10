import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce } from "lodash";



const margin = { left: 60, right: 40, top: 50, bottom: 50 };

// helper for stock categories -------------

const categories = {
    Energy:       ["XOM", "CVX", "HAL"],
    Industrials:  ["MMM", "CAT", "DAL"],
    Consumer:     ["MCD", "NKE", "KO"],
    Healthcare:   ["JNJ", "PFE", "UNH"],
    Financials:   ["JPM", "GS", "BAC"],
    Tech:         ["AAPL", "MSFT", "NVDA", "GOOGL", "META"]
  };

const categoryOf = {};
for (const category in categories) {
    const symbols = categories[category];
    symbols.forEach(symbol => {
        categoryOf[symbol] = category;
    });
}

const categoryColour = d3.scaleOrdinal()
  .domain(Object.keys(categories))
  .range(d3.schemeTableau10.slice(0, Object.keys(categories).length));

// -----------------------------------------
  
  
export function ScatterPlot({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dataRef = useRef([]); 


  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            drawPlot(dataRef.current, width, height, selectedStock, svgRef);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    d3.csv(`/data/tsne.csv`, d => ({
        Ticker: d.ticker,
        x: +d.x,
        y: +d.y,
        Category: categoryOf[d.ticker] ?? "Other" 
      })).then(rows => {
        dataRef.current = rows;
        const { width, height } = containerRef.current.getBoundingClientRect();
        drawPlot(rows, width, height, selectedStock, svgRef);
      });

    return () => resizeObserver.disconnect();
  }, [selectedStock]);

  

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="bar-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawPlot(rows, width, height, selectedStock, svgRef) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear previous render

    // const yExtents = d3.extent(bars.map((d) => d.value));
    // const xCategories = [...new Set(bars.map((d) => d.category))];
    
    const xScale = d3.scaleLinear()
      .domain(d3.extent(rows, d => d.x)).nice()
      .range([margin.left, width - margin.right]);


    const yScale = d3.scaleLinear()
      .domain(d3.extent(rows, d => d.y)).nice()
      .range([height - margin.bottom, margin.top]);

   
      const plotG = svg.append("g");


      const clipId = `clip-${Math.random().toString(36).slice(2)}`;
      svg.append("clipPath")
        .attr("id", clipId)
        .append("rect")
          .attr("x", margin.left)
          .attr("y", margin.top)
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom);
  
      svg.append("g")
        .attr("clip-path", `url(#${clipId})`);
  
      // View 2 : plot
      const pts = svg.append("g")
        .selectAll("circle")
        .data(rows)
        .enter()
        .append("circle")
          .attr("cx", d => xScale(d.x))
          .attr("cy", d => yScale(d.y))
          .attr("r", d => d.Ticker === selectedStock ? 7 : 4)
          .attr("fill", d => categoryColour(d.Category))
          .attr("stroke", d => d.Ticker === selectedStock ? "#000" : "none")
          .attr("stroke-width", 1);
  
      // View 2 : label (only selected stock)
      plotG.selectAll(".sel-label")
        .data(rows.filter(d => d.Ticker === selectedStock))
        .enter()
        .append("text")
          .attr("class", "sel-label")
          .attr("x", d => xScale(d.x))
          .attr("y", d => yScale(d.y) - 8)
          .attr("text-anchor", "middle")
          .style("font-size", "0.7rem")
          .style("font-weight", "700")
          .text(d => d.Ticker);
  
       // View 2 : axis
      const xAxisG = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom })`)
        .call(d3.axisBottom(xScale));
  
      const yAxisG = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height  - margin.bottom + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "0.75rem")
        .text("t-SNE 1");
  
      svg.append("text")
        .attr("x", - height / 2 + margin.top +10 )
        .attr("y", 14)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "0.75rem")
        .text("t-SNE 2");
  
      // View 2 : legend
      const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${ margin.top  -20})`);
  
      Object.keys(categories).forEach((category, i) => {
        const item = legend.append("g")
          .attr("transform", `translate(${i * 88},0)`);
  
        item.append("rect")
          .attr("width", 10).attr("height", 10)
          .attr("fill", categoryColour(category));
  
        item.append("text")
          .attr("x", 14).attr("y", 9)
          .style("font-size", "0.65rem")
          .text(category);
      });
  

      // View 2 : Zoom
      const xInit = xScale.copy();
      const yInit = yScale.copy();
  
      const panExtent = [
        [margin.left, margin.top],
        [xScale(d3.max(rows, d => d.x)), yScale(d3.min(rows, d => d.y))]
      ];
  
      const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent(panExtent)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("zoom", e => {
          const t = e.transform;
          const zx = t.rescaleX(xInit);
          const zy = t.rescaleY(yInit);
  
          xAxisG.call(d3.axisBottom(zx));
          yAxisG.call(d3.axisLeft(zy));
  
          pts.attr("cx", d => zx(d.x)).attr("cy", d => zy(d.y));
          plotG.selectAll(".sel-label")
            .attr("x", d => zx(d.x))
            .attr("y", d => zy(d.y) - 8);
        });
  
      svg.call(zoom);
}
