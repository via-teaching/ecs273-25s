// ChatGPT was used to help learn how to read .txt files

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ComponentSize } from "../types";

function layoutNews(width: number, height: number, ticker: string) {
    var newsDiv = d3.select("#news-div")
    newsDiv.selectAll("*").remove()

    fetch("http://localhost:8000/stocknews/" + ticker)
    .then((res) => res.json())
    .then((result) => {
        var articles = newsDiv.selectAll(".article")
        .data(result["News"])
        .enter()
        .append("div")
        .attr("class", "article")
        .style("margin", "10px")
        .style("border", "1px solid black")
        .style("border-radius", "0.75rem")
        .style("padding", "10px")

        articles.append("div")
        .attr("class", "title")
        .text((data) => data["Title"])
        .style("font-weight", "bold")

        articles.append("div")
        .attr("class", "date")
        .text((data) => data["Date"])

        articles.append("div")
        .attr("class", "content")
        .style("display", "none")
        .style("margin-top", "10px")
        .style("white-space", "pre-wrap")
        .text((data) => data["content"]);

        articles.on("click", function(_, d) {
            var contentDiv = d3.select(this).select(".content");
            var isVisible = contentDiv.style("display") === "block";
            contentDiv.style("display", isVisible ? "none" : "block");
        });

    })
}

export function ListNews() {
    const containerRef = useRef<HTMLDivElement>(null);
    var [ticker, setTicker] = useState("XOM");

    useEffect(() => {
        d3.select("select").on("change.news", (value) => {setTicker(value.target.value)});
    }, []);


    useEffect(() => {
        if (!containerRef.current) return;
        const {width, height} = containerRef.current.getBoundingClientRect() as ComponentSize;

        layoutNews(width, height, ticker)

    }, [ticker]);

    return (
        <div className = "chart-container d-flex" ref = {containerRef} style = {{width: "100%", height: "100%"}}>
            <div id = "news-div" style = {{width: "100%", height: "100%", overflowY: "auto"}}></div>
        </div>
    );
}