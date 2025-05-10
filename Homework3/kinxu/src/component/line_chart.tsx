import * as d3 from "d3";
import { createContext, useEffect, useRef, useState } from "react";
import { isEmpty, debounce, max } from 'lodash';
import { tickers } from "./options";
import { ComponentSize, Margin } from "../types";

interface StockData {
    date: string;
    open: number;
    high: number;
    low: number;
    volume: number;
}

type price = {"date": string, "value": number};
const margin = { left: 40, right: 20, top: 20, bottom: 60 } as Margin;

function drawLineChart(svgElement: SVGSVGElement, data: DSVRowArray<StockData>, width: number, height: number) {
    var dates: string[] = [];
    var prices: number[] = []
    var opens: price[] = [];
    var lows: price[] = [];
    var highs: price[] = [];
    var closes: price[] = [];

    for (const timestampData of data) {
        const date = timestampData["Date"];
        const open = Number(timestampData["Open"]);
        const low = Number(timestampData["Low"]);
        const high = Number(timestampData["High"]);
        const close = Number(timestampData["Close"]);
   
        dates.push(date);
        opens.push({"date": date, "value": open});
        lows.push({"date": date, "value": low});
        highs.push({"date": date, "value": high});
        closes.push({"date": date, "value": close});
        prices.push(open);
        prices.push(low);
        prices.push(high);
        prices.push(close);
    }

    var stockDatas = {"Open": opens, "Low": lows, "High": highs, "Close": closes}
    var yExtents = d3.extent(prices) as [number, number];

    const svg = d3.select(svgElement);
    const svgParent = svg.node()?.parentElement;
    const parentWidth: number = svgParent?.getBoundingClientRect()["width"];
    const minXAxisWidth: number = data.length * 100;
    const xAxisWidth: number = max([width, minXAxisWidth]);
    svg.attr("width", xAxisWidth);
    svg.selectAll("*").remove()

    var xScale = d3.scalePoint()
    .rangeRound([margin.left, xAxisWidth - margin.right])
    .domain(dates)
    .padding(0.1);

    var yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(yExtents)

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    var plot = svg.append("g")
    .attr("id", "plot-content");
    
    const xAxisGroup = plot.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

    plot.append("g")
    .attr("transform", `translate(${(xAxisWidth / 2) - margin.left}, ${height - margin.top - 5})`)
    .append("text")
    .text("Date (YYYY-MM-DD)")
    .style("font-size", ".8rem");

    // y axis
    const yAxisGroup = plot.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

    plot.append("g")
    .attr("transform", `translate(10, ${height / 2}) rotate(-90)`)
    .append("text")
    .text("Price ($)")
    .style("font-size", ".8rem");

    const color = d3.scaleOrdinal(d3.schemeObservable10)

    const line = d3.line<price>()
    .x((data) => xScale(data.date))
    .y((data) => yScale(data.value))

    const linesGroup = plot.append("g")
    
    for (const key in stockDatas) {
        linesGroup.append("path")
        .datum(stockDatas[key])
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 1)
        .attr("d", line);
    }

    const legend = plot.append("g")
    .selectAll(".legend")
    .data(Object.keys(stockDatas))
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (dataType, i) => `translate(${margin.left + 10}, ${margin.top + (i * 10)})`)

    legend.append("rect")
    .attr("x", 0)
    .attr("width", 6)
    .attr("height", 6)
    .attr("fill", (dataType) => color(dataType));

    legend.append("text")
    .attr("x", 10)
    .attr("y", 5)
    .text((dataType) => dataType)
    .attr("font-size", ".4rem");
}

export function LineChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    var [ticker, setTicker] = useState("AAPL")

    useEffect(() => {
        d3.select("select").on("change.line", (value) => {setTicker(value.target.value)});
    }, []);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;
        var fileName = "../../data/stockdata/" + ticker + ".csv";
        const resizeObserver = new ResizeObserver(
            debounce((entries: ResizeObserverEntry[]) => {
                for (const entry of entries) {
                    if (entry.target !== containerRef.current) continue;

                    const {width, height} = entry.contentRect as ComponentSize;
                    d3.csv<"StockData">(fileName).then((data) => {
                        if (width && height && !isEmpty(data)) {
                            drawLineChart(svgRef.current!, data, width, height);
                        }
                    });
                    
                }
            }, 100)
        );

        resizeObserver.observe(containerRef.current);
        const {width, height} = containerRef.current.getBoundingClientRect();
        d3.csv<"StockData">(fileName).then((data) => {
            drawLineChart(svgRef.current!, data, width, height);
        });

        return () => resizeObserver.disconnect();
    }, [ticker]);

    return (
        <div className = "chart-container d-flex" ref = {containerRef} style = {{width: "100%", height: "100%", overflowX: "auto"}}>
            <svg id = "line-svg" ref={svgRef} width = "100%" height = "100%"></svg>
        </div>
    );
}