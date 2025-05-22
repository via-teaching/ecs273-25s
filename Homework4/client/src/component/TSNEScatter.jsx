import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function TSNEScatter({ selectedTicker }) {
    const svgRef = useRef();
    const containerRef = useRef(); 

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return; 
        const { width, height } = container.getBoundingClientRect(); 

        fetch("http://localhost:8000/tsne")
            .then(res => res.json())
            .then(data => {
                data.forEach(d => {
                    d.x = +d.x;
                    d.y = +d.y;
                    d.ticker = d.ticker; 
        });


        const margin = { top: 20, right: 150, bottom: 60, left: 55 };

        // Generate a unique color for each ticker
        const tickers = Array.from(new Set(data.map(d => d.ticker))); 
        const color = d3.scaleOrdinal().domain(tickers).range(d3.schemeCategory10);

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove();

        const chart = svg.append("g")
            .attr("class", "chart")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        const xExtent = d3.extent(data, d => d.x);
        const yExtent = d3.extent(data, d => d.y);

        const x = d3.scaleLinear().domain(xExtent).range([0, plotWidth]);
        const y = d3.scaleLinear().domain(yExtent).range([plotHeight, 0]);

        // Add X axis
        const xAxisGroup = chart.append("g")
            .attr("transform", `translate(0,${plotHeight})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(x).ticks(10));
        chart.append("text")
            .attr("class", "x-label")
            .attr("x", plotWidth / 2)
            .attr("y", plotHeight + 40)
            .attr("text-anchor", "middle")
            .text("Dimension 1");

        // Add Y axis
        const yAxisGroup = chart.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(10));
        chart.append("text")
            .attr("class", "y-label")
            .attr("x", -plotHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Dimension 2");

        const pointsGroup = chart.append("g").attr("class", "points");

        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - margin.right + 30},${margin.top})`);

        tickers.forEach((ticker, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", color(ticker));

            legendRow.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .text(ticker);
        });

        function renderPoints(transform = d3.zoomIdentity) {
            const newX = transform.rescaleX(x);
            const newY = transform.rescaleY(y);

            pointsGroup.selectAll("circle")
                .data(data)
                .join("circle")
                .attr("cx", d => newX(d.x))
                .attr("cy", d => newY(d.y))
                .attr("r", d => d.ticker === selectedTicker ? 10 : 4)
                .attr("fill", d =>
                    d.ticker === selectedTicker
                      ? d3.color(color(d.ticker)).brighter(1)  
                      : color(d.ticker)
                 )
                .attr("stroke", d => 
                    d.ticker === selectedTicker 
                    ? d3.color(color(d.ticker)).brighter(3)  
                    : color(d.ticker)
                )
                .attr("stroke-width", 1.5)
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .attr("r", 30) 
                        .attr("stroke", "none")
                        .attr("stroke-width", 2);

                    chart.append("text")
                        .attr("class", "tooltip")
                        .attr("x", newX(d.x) + 15)
                        .attr("y", newY(d.y) - 5)
                        .text(`(${d.x.toFixed(2)}, ${d.y.toFixed(2)})`)
                        .style("font-size", "15px");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("r", d => selectedTicker && d.ticker === selectedTicker ? 7 : 4)
                        .attr("stroke", d => 
                            selectedTicker && d.ticker === selectedTicker 
                            ? d3.color(color(d.ticker)).brighter(1)  
                            : color(d.ticker)
                        )
                        .attr("stroke-width", 1.5);
                        
                    chart.selectAll(".tooltip").remove();
                    
                });

            xAxisGroup.call(d3.axisBottom(newX));
            yAxisGroup.call(d3.axisLeft(newY));
            
        }

        renderPoints();

        svg.call(d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", (event) => {
                renderPoints(event.transform);
            }));
    });
    }, [selectedTicker]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
        </div>
    );
}