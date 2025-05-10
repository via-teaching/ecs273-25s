import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

export function ScatterPlot({ stock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [stockData, setStockData] = useState([]);
  const [data, setData] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  const stockCategory = {
    'xom': 'Energy', 'cvx': 'Energy', 'hal': 'Energy',
    'mmm': 'Industrials', 'cat': 'Industrials', 'dal': 'Industrials',
    'mcd': 'Consumer Discretionary/Staples', 'nke': 'Consumer Discretionary/Staples',
    'ko': 'Consumer Discretionary/Staples', 'jnj': 'Healthcare', 'pfe': 'Healthcare',
    'unh': 'Healthcare', 'jpm': 'Financials', 'gs': 'Financials', 'bac': 'Financials',
    'aapl': 'Information Tech/Comm.Sec', 'msft': 'Information Tech/Comm.Sec',
    'nvda': 'Information Tech/Comm.Sec', 'googl': 'Information Tech/Comm.Sec', 'meta': 'Information Tech/Comm.Sec'
  };

  const tickers = [
    "xom", "cvx", "hal", "mmm", "cat", "dal", "mcd", "nke", "ko", "jnj",
    "pfe", "unh", "jpm", "gs", "bac", "aapl", "msft", "nvda", "googl", "meta"
  ];

  useEffect(() => {
    if (stock) {
    d3.csv("/data/tsne.csv").then((csvData) => {
      const enriched = csvData.map((d, i) => {
        const ticker = tickers[i].toLowerCase();
        return {
          tsne_x: +d.Dim1,
          tsne_y: +d.Dim2,
          stock_name: tickers[i],
          category: stockCategory[ticker] || "Unknown",
        };
      });
      setData(enriched);
    });
    }
    }, [stock]);

  useEffect(() => {
      if (!containerRef.current || !svgRef.current || stockData.length === 0) return;
  
      const resizeObserver = new ResizeObserver(
        debounce((entries) => {
          for (const entry of entries) {
            if (entry.target !== containerRef.current) continue;
            const { width, height } = entry.contentRect;
            if (width && height) {
              drawChart(svgRef.current, stockData, width, height);
            }
          }
        }, 100)
      );
  
      resizeObserver.observe(containerRef.current);
  
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width && height) {
        drawChart(svgRef.current, stockData, width, height);
      }
  
      return () => resizeObserver.disconnect();
    }, [stockData]);
  

  useEffect(() => {
    if (!data.length || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll('*').remove(); 

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, (d) => d.tsne_x)-10, d3.max(data, (d) => d.tsne_x)+10])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, (d) => d.tsne_y)-20, d3.max(data, (d) => d.tsne_y)+20])
      .range([height - margin.bottom, margin.top]);

    const g = svg.append("g");

    // Circle
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.tsne_x))
      .attr("cy", (d) => yScale(d.tsne_y))
      .attr("r", (d) => (d.stock_name === stock ? 8 : 5))
      .attr("fill", (d) => {
        if (d.category === 'Energy') return 'rgb(77, 241, 82)';
        if (d.category === 'Industrials') return ' #ffc562';
        if (d.category === 'Consumer Discretionary/Staples') return 'rgb(176, 79, 221)';
        if (d.category === 'Healthcare') return ' #ff6d74';
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
      .attr("y", d => yScale(d.tsne_y)+20)
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
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`);
    
    const yAxisGroup = g.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
    
    // Zoom
    const zoom = d3.zoom()
    .scaleExtent([0.5, 20]) 
    .on("zoom", (event) => {
    const newXScale = event.transform.rescaleX(xScale);
    const newYScale = event.transform.rescaleY(yScale);
    g.selectAll("circle")
      .attr("cx", (d) => newXScale(d.tsne_x))
      .attr("cy", (d) => newYScale(d.tsne_y));

    g.selectAll(".label")
      .attr("x", (d) => newXScale(d.tsne_x))
      .attr("y", (d) => newYScale(d.tsne_y) + 20)

    xAxisGroup.call(d3.axisBottom(newXScale));
    yAxisGroup.call(d3.axisLeft(newYScale));
  });

  svg.call(zoom);

  const categories = ['Energy', 'Industrials', 'Consumer Discretionary/Staples', 'Healthcare', 'Financials', 'Information Tech/Comm.Sec'];
  const colors = ['rgb(77, 241, 82)', '#ffc562', 'rgb(176, 79, 221)', '#ff6d74', 'rgb(68, 158, 237)', 'rgb(7, 126, 71)'];

    categories.forEach((category, i) => {
      svg.append("rect")
        .attr("x", width - 220)
        .attr("y", height - i * 20 -90)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colors[i]);

      svg.append("text")
        .attr("x", width - 200)
        .attr("y", height - i * 20 -80)
        .text(category)
        .attr("font-size", 12)
        .attr("fill", "black");
    });



  }, [data, selectedStock]);



  return (
    <div className="chart-container"
     ref={containerRef}
     style={{ width: "100%", height: "100%", position: "relative" }}
     >
      <svg id="scatter-svg" ref={svgRef} width="100%" height="100%"></svg>

    </div>
  );
};
