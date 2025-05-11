// ChatGPT was used to help learn D3.js and help implement components like zoom.

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from "../types";

interface Point {
    x: number;
    y: number;
    Ticker: string;
    Sector: string;
}

const margin = { left: 40, right: 20, top: 20, bottom: 60 } as Margin;

function drawScatterPlot(svgElement: SVGSVGElement, data: DSVRowArray<Point>, width: number, height: number, ticker: string) {
    var x: number[] = [];
    var y: number[] = [];
    var sectors: string[] = [];

    for (const point of data) {
        x.push(Number(point["x"]));
        y.push(Number(point["y"]));
        const sector: string = point["Sector"];
        if (!sectors.includes(sector)) {
            sectors.push(sector);
        }
    }

    var xExtents = d3.extent(x) as [number, number];
    var yExtents = d3.extent(y) as [number, number];

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right])
    .domain(xExtents);
    
    var yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(yExtents);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    var plot = svg.append("g")
    .attr("id", "plot-content")
    .attr("transform", "translate(0, 0)");

    const xAxisGroup = plot.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

    plot.append("g")
    .attr("transform", `translate(${(width / 2)}, ${height - margin.top - 5})`)
    .append("text")
    .style("text-anchor", "middle")
    .text("T-SNE Dimension 1")
    .style("font-size", ".8rem");

    const yAxisGroup = plot.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

    plot.append("g")
    .attr("transform", `translate(10, ${height / 2}) rotate(-90)`)
    .append("text")
    .text("T-SNE Dimension 2")
    .style("font-size", ".8rem");

    plot.append("g")
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.top + 5})`)
    .attr("dy", '0.5rem')
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("T-SNE Scatter View");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pointsGroup = plot.append("g")
    .attr("transform", `translate(0, 0)`)

    const points = pointsGroup    
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d["x"]))
    .attr("cy", (d) => yScale(d["y"]))
    .attr("class", (d) => "point-" + d["Sector"])
    .attr("r", (d) => {
        if (d["Ticker"] == ticker) {
            return 8
        }
        else {
            return 4
        }
    })
    .attr("fill", (d) => color(d["Sector"]))

    pointsGroup
    .selectAll("text")
    .data(data.filter((d) => d["Ticker"] == ticker))
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d["x"]) + 7)
    .attr("y", (d) => yScale(d["y"]) - 7)
    .text((d) => d["Ticker"])
    .attr("font-size", "12px")
    .attr("fill", "black")
    .attr("font-weight", "bold")

    const legend = plot.append("g")
    .selectAll(".legend")
    .data(sectors)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (sector, i) => `translate(${margin.left + 10}, ${margin.top + (i * 20)})`)

    legend.append("rect")
    .attr("x", 0)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (sector) => color(sector));

    legend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text((sector) => sector);

    const zoom = d3.zoom()
        .scaleExtent([0.5, 20])
        .on("zoom", (event) => {
            const transform = event.transform;

            const newXScale = transform.rescaleX(xScale);
            const newYScale = transform.rescaleY(yScale);

            xAxisGroup.call(xAxis.scale(newXScale));
            yAxisGroup.call(yAxis.scale(newYScale));

            points.attr("cx", d => newXScale(d["x"]))
            .attr("cy", d => newYScale(d["y"]));

            pointsGroup.selectAll("text")
            .attr("x", d => newXScale(d["x"]) + 7)
            .attr("y", d => newYScale(d["y"]) - 7);
        });

    svg.call(zoom);

    const svgParent = svg.node()?.parentElement;
    
    const parentD3 = d3.select(svgParent);
    var resetButton = parentD3.select("#reset-zoom");

    if (resetButton.empty()) {
        resetButton = parentD3.insert("button", "svg")
        .attr("id", "reset-zoom")
        .style("position", "absolute")
        .style("top", "50")
        .style("left", "20px")
        .text("Reset Zoom")
        .style("font-size", ".8rem");
    }

    resetButton.on("click", () => {
        svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });
}

export function TsnePlot() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    var [ticker, setTicker] = useState("AAPL")
    
    useEffect(() => {
        d3.select("select").on("change.tsne", (value) => {setTicker(value.target.value)})
    }, []);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;
        const resizeObserver = new ResizeObserver(
            debounce((entries: ResizeObserverEntry[]) => {
                for (const entry of entries) {
                    if (entry.target !== containerRef.current) continue;

                    const {width, height} = entry.contentRect as ComponentSize
                    d3.csv<"Point">("../../data/tsne_data.csv").then((data) => {
                        if (width && height && !isEmpty(data)) {
                            drawScatterPlot(svgRef.current!, data, width, height, ticker);
                        }
                    });

                }
            }, 100)
        )

        resizeObserver.observe(containerRef.current)

        // const {width, height} = containerRef.current.getBoundingClientRect();
        // d3.csv<"Point">("../../data/tsne_data.csv").then((data) => {
        //     drawScatterPlot(svgRef.current!, data, width, height, ticker)
        // })

        return () => resizeObserver.disconnect()

    }, [ticker])


    return (
        <div className = "chart-container d-flex" ref = {containerRef} style = {{width: "100%", height: "100%", overflowX: "auto"}}>
            <svg id = "tsne-svg" ref={svgRef} width = "100%" height = "100%"></svg>
        </div>
    );
}