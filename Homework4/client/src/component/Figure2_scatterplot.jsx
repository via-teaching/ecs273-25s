import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';
// import Data from "../../data/demo.json";

const map_departament_to_tickers = {
  'Energy': ['XOM', 'CVX', 'HAL'],
  'Industrials': ['MMM', 'CAT', 'DAL'],
  'Consumer_Discretionary': ['MCD', 'NKE', 'KO'],
  'Healthcare': ['JNJ', 'PFE', 'UNH'],
  'Financials': ['JPM', 'BAC', 'GS'],
  'Information_Technology': ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'],
};

const tickerTodepartament = {};
Object.entries(map_departament_to_tickers).forEach(([departament, departamentTickers]) => {
  departamentTickers.forEach(ticker => {
    tickerTodepartament[ticker] = departament;
  });
});

const margin = { left: 60, right: 100, top: 40, bottom: 60 };

export function Figure2_scatterplot() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const curr_stock_selected = useRef('XOM');

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
  
    const filter_stock_selected = d3.select('#bar-select');
    // const curr_stock = filter_stock_selected.property('value');
    let curr_stock = filter_stock_selected.property('value');
  
    // If no stock is selected, set a default one
    if (!curr_stock || curr_stock === "") {
      curr_stock = 'XOM';
      filter_stock_selected.property('value', curr_stock);
    }
    
    curr_stock_selected.current = curr_stock;
    load_tsne_data_mongo(curr_stock);
  
    const handleSelectChange = function(event) {
      const gotten_stock_val = event.target.value;
      curr_stock_selected.current = gotten_stock_val;
      load_tsne_data_mongo(gotten_stock_val);
    };
  
    filter_stock_selected.on('change.figure2', handleSelectChange);
  
    return () => {
      filter_stock_selected.on('change.figure2', null);
    };
  }, []);
  


  // const load_tsne_data_mongo = (stock) => {
  const load_tsne_data_mongo = async (stock) => {

    // const path_tsne_csv_from_hw2 = "../data/tsne.csv";
    
  //   d3.csv(path_tsne_csv_from_hw2).then(data => {
  //     const tsne_data_csv = data.map(d => {
  //       const ticker = d.ticker;
  //       const departament = tickerTodepartament[ticker]
  //       const dim1 = +d.dim1
  //       const dim2 = +d.dim2
        
  //       return {
  //         stock: ticker,
  //         departament: departament,
  //         x: dim1,
  //         y: dim2
  //       };
  //     })
      
  //     setupResizeObserver(tsne_data_csv, stock);
  //   });
  // };
  
    // idk if we can hardocde this, but i will just call it from mongo, since we alr have the code for it
    const response = await fetch('http://localhost:8000/stock_list');
    const data = await response.json();
    const tickers = data.tickers;
    
    // Create array to store all tsne data points
    const tsne_data = [];
    
    // Fetch TSNE data for each ticker
    // for ticker in tickers (used llm to translate this py syntax to jsx)
    for (const ticker of tickers) {
      const response = await fetch(`http://localhost:8000/tsne/?stock_name=${ticker}`);
      const data = await response.json();
      
      tsne_data.push({
        stock: data.Stock,
        departament: tickerTodepartament[data.Stock],
        x: data.x,
        y: data.y
      });
    }

    setupResizeObserver(tsne_data, stock); 
};

  const setupResizeObserver = (data, stock) => {
    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            drawChart(svgRef.current, data, stock, width, height);
          }
        }
      }, 100)
    );
    
    resizeObserver.observe(containerRef.current);
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current, data, stock, width, height);
    }
    
    return () => resizeObserver.disconnect();
  };

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="tsne-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

// scatterplot
function drawChart(svgElement, data, stock, width, height) {
  // https://www.reddit.com/r/RedesignHelp/comments/84c6bl/official_reddit_brand_hex_color_codes/?rdt=33204
  const map_color_of_departament = {
    'Energy': '#FFB100',                 // mango
    'Industrials': '#ED001C',            // red
    'Consumer_Discretionary': '#A16A3E', // brown
    'Healthcare': '#FF63AC',             // pink
    'Financials': '#92E234',             // lime
    'Information_Technology': '#149EF0'  // blue
  };
  const departaments = Object.keys(map_departament_to_tickers);

  const svg = d3.select(svgElement);
  svg.selectAll('*').remove(); // clear previous render
  
  // this gives the MAX and MIN of the field
  const xExtent = d3.extent(data, d => d.x);
  const yExtent = d3.extent(data, d => d.y);
  
  // min& max for y axis
  const xMax = xExtent[1];
  const xMin = xExtent[0];
  const xPadding = (xMax - xMin) * 0.1; 
  
  const yMax = yExtent[1];
  const yMin = yExtent[0];
  const yPadding = (yMax - yMin) * 0.1; 
  
  // keeps linear relationship between dim1 and dim2
  const xScale = d3.scaleLinear()
    .domain([xMin - xPadding, xMax + xPadding])
    .range([margin.left, width - margin.right]);
  
  const yScale = d3.scaleLinear()
    .domain([yMin - yPadding, yMax + yPadding])
    .range([height - margin.bottom, margin.top]);
  
  const scatterplot_group = svg.append("g");
  
  
  // TITLE of plot
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${margin.top / 2})`)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    // .text(`TSNE Scatter Plot"`);
    .text(`${stock} Stock TSNE Scatter Plot`);

  
  const xAxis = d3.axisBottom(xScale)
    .ticks(15);
  
  const yAxis = d3.axisLeft(yScale)
    .ticks(15);
  
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);
  
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
  
  // for the X axis
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - 10})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("TSNE dimension 1");
  
  // for the Y axis
  svg.append("text")
    .attr("transform", `translate(${margin.left / 3}, ${height / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("TSNE dimension 2");
  
  scatterplot_group.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", d => `point ${d.stock === stock ? "selected" : ""}`) 
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", d => d.stock === stock ? 10 : 6) 
    .attr("fill", d => map_color_of_departament[d.departament])
    .attr("opacity", d => d.stock === stock ? 1 : 0.7)
    .attr("stroke", d => d.stock === stock ? "#000" : "none")
    .attr("stroke-width", 1.5);
  
  const curr_stock = data.find(d => d.stock === stock);
  if (curr_stock) {
    scatterplot_group.append("text")
      .attr("x", xScale(curr_stock.x))
      .attr("y", yScale(curr_stock.y) - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(curr_stock.stock);
  }
  
  // legend
  const legend_chunk = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margin.right - 70}, ${margin.top})`);

  // the legend
  departaments.forEach((departament, i) => {
    const curr_legend = legend_chunk.append("g")
      .attr("transform", `translate(${5}, ${i * 20})`);
    
    curr_legend.append("circle")
      .attr("r", 7)
      .attr("fill", map_color_of_departament[departament]);
    
    curr_legend.append("text")
      .attr("x", 13)
      .attr("y", 4)
      .style("font-size", "13px")
      .text(departament.replace('_', ' '));
  });
  
  // looked up documentation + llm to help implement/understand zooming syntax/logic
  // todo need to look into how to get the zoom working professionally for the project (for this HW it should be fine)
  // it currently works, asthe instructions did not eloborate on the limitations of the zoom 
  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("zoom", zoomed);
  
  function zoomed(event) {
    const transform = event.transform;
    scatterplot_group.attr("transform", transform);
    
    // update both x and y axis with the zoom
    svg.select(".x-axis").call(xAxis.scale(transform.rescaleX(xScale)));
    svg.select(".y-axis").call(yAxis.scale(transform.rescaleY(yScale)));
  }
  
  svg.call(zoom);
}
