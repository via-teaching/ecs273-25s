
// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";

// export default function TSnePlot({ data, selectedStock }) {
//   const ref = useRef();
//   // console.log("selected ticker: ", selectedStock)
//   useEffect(() => {
//     if (!data || data.length === 0) return;
//     // console.log("data: ", data)
//     const svg = d3.select(ref.current);
//     svg.selectAll("*").remove();

//     const width = 600;
//     const height = 400;
//     const margin = { top: 20, right: 20, bottom: 40, left: 40 };

//     const sectors = [...new Set(data.map(d => d.sector))];
//     const color = d3.scaleOrdinal().domain(sectors).range(d3.schemeTableau10);

//     const x = d3.scaleLinear()
//       .domain(d3.extent(data, d => d.x)) // Check if x values are reasonable
//       .range([margin.left, width - margin.right]);

//     const y = d3.scaleLinear()
//       .domain(d3.extent(data, d => d.y)) // Check if y values are reasonable
//       .range([height - margin.bottom, margin.top]);

//     const g = svg.append("g");

//     // Check if data.x and data.y have reasonable values
//     // console.log("X values range:", d3.extent(data, d => d.x));
//     // console.log("Y values range:", d3.extent(data, d => d.y));

//     const circles = g.selectAll("circle")
//       .data(data)
//       .enter()
//       .append("circle")
//       .attr("cx", d => x(d.x))
//       .attr("cy", d => y(d.y))
//       .attr("r", d => d.ticker === selectedStock ? 8 : 4)
//       .attr("fill", d => color(d.sector))
//       .attr("stroke", d => d.ticker === selectedStock ? "black" : "none");

//     if (data.find(d => d.ticker === selectedStock)) {
//       const selected = data.find(d => d.ticker === selectedStock);
//       g.append("text")
//         .attr("x", x(selected.x) + 10)
//         .attr("y", y(selected.y))
//         .text(selected.ticker)
//         .attr("font-size", "12px")
//         .attr("fill", "black");
//     }

//     const legend = svg.append("g")
//       .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);
//     sectors.forEach((sector, i) => {
//       legend.append("rect")
//         .attr("x", 0).attr("y", i * 20)
//         .attr("width", 12).attr("height", 12)
//         .attr("fill", color(sector));
//       legend.append("text")
//         .attr("x", 18).attr("y", i * 20 + 10)
//         .text(sector)
//         .attr("font-size", "12px");
//     });

//     const zoom = d3.zoom()
//       .scaleExtent([1, 10])
//       .on("zoom", event => {
//         g.attr("transform", event.transform);
//       });

//     svg.call(zoom);

//     svg.append("g")
//       .attr("transform", `translate(0,${height - margin.bottom})`)
//       .call(d3.axisBottom(x));

//     svg.append("g")
//       .attr("transform", `translate(${margin.left},0)`)
//       .call(d3.axisLeft(y));

//     // Add X axis label
//     svg.append("text")
//       .attr("transform", `translate(${width / 2}, ${height - 10})`)
//       .style("text-anchor", "middle")
//       .text("TSNE 1");

//     // Add Y axis label
//     svg.append("text")
//       .attr("transform", `translate(${10}, ${height / 2}) rotate(-90)`)
//       .style("text-anchor", "middle")
//       .text("TSNE 2");

//   }, [data, selectedStock]);

//   return <svg ref={ref} width="100%" height="100%"></svg>;
// }

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Sectors information
const tickers_by_category = {
  'Energy': ['XOM', 'CVX', 'HAL'],
  'Industrials': ['MMM', 'CAT', 'DAL'],
  'Consumer Discretionary/Staples': ['MCD', 'NKE', 'KO'],
  'Healthcare': ['JNJ', 'PFE', 'UNH'],
  'Financials': ['JPM', 'GS', 'BAC'],
  'Information Tech/Comm. Svc': ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']
};
const tickers = ['GS', 'KO', 'GOOGL', 'NVDA', 'DAL', 'JNJ', 'MSFT', 'UNH', 'CVX', 'CAT',
  'JPM', 'MMM', 'NKE', 'MCD', 'BAC', 'META', 'XOM', 'HAL', 'PFE', 'AAPL']

export default function TSnePlot({ data, selectedStock }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Create a sector lookup map
    const sectorLookup = {};
    for (const [sector, tickers] of Object.entries(tickers_by_category)) {
      // console.log("sector, tickers: ", sector, tickers)
      tickers.forEach(ticker => {
        sectorLookup[ticker] = sector;
      });
    }
    console.log("sectorLookup: ", sectorLookup)
    // Add sector information to your data
    // data.forEach(d => {
    //   console.log(d);  // Make sure d.ticker matches the tickers in `sectorLookup`
    //   d.sector = sectorLookup[d.ticker];  // Add the sector to each data point
    // });
    // ... inside useEffect, after creating sectorLookup:

    // 1️⃣ assign ticker and sector to each data row
    data.forEach((d, i) => {
      d.ticker = tickers[i];
      d.sector = sectorLookup[d.ticker];
    });


    const sectors = [...new Set(data.map(d => d.sector))];
    const color = d3.scaleOrdinal().domain(sectors).range(d3.schemeTableau10);
    console.log("sectors: ", sectors);
    console.log("color scale: ", color);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x)) // Check if x values are reasonable
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y)) // Check if y values are reasonable
      .range([height - margin.bottom, margin.top]);

    const g = svg.append("g");

    const circles = g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", d => d.ticker === selectedStock ? 8 : 4)
      .attr("fill", d => color(d.sector))
      .attr("stroke", d => d.ticker === selectedStock ? "black" : "none");

    if (data.find(d => d.ticker === selectedStock)) {
      const selected = data.find(d => d.ticker === selectedStock);
      g.append("text")
        .attr("x", x(selected.x) + 10)
        .attr("y", y(selected.y))
        .text(selected.ticker)
        .attr("font-size", "12px")
        .attr("fill", "black");
    }

    // Create a legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);
    sectors.forEach((sector, i) => {
      legend.append("rect")
        .attr("x", 0).attr("y", i * 20)
        .attr("width", 12).attr("height", 12)
        .attr("fill", color(sector));
      legend.append("text")
        .attr("x", 18).attr("y", i * 20 + 10)
        .text(sector)
        .attr("font-size", "12px");
    });

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", event => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add X axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .text("TSNE 1");

    // Add Y axis label
    svg.append("text")
      // .attr("transform", `translate(${10}, ${height / 2}) rotate(-90)`)
      .attr("transform", `translate(${margin.left - 25}, ${height / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("TSNE 2");

  }, [data, selectedStock]);

  return <svg ref={ref} width="100%" height="100%"></svg>;
}


