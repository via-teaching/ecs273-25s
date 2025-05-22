// ChatGPT was used to help learn how to read .txt files

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { ComponentSize } from "../types";

function layoutNews(data: DSVRowArray<Point>, width: number, height: number, ticker: string) {
    var newsDiv = d3.select("#news-div")
    newsDiv.selectAll("*").remove()

    const promises = data.map((d) => {
        var name = d["File"];
        if (name == undefined) return
        var encoded = encodeURIComponent(name);
        var path = "/data/stocknews/" + ticker + "/" + encoded;
        return d3.text(path)
        .then((text) => {
            const lines = text.split("\n")
            return {"title": lines[0], "date": lines[1], "url": lines[2], "content": lines.slice(3).join("\n")}
        })
    })

    Promise.all(promises)
    .then((results) => {
    var validResults = results.filter((data) => data !== undefined && data !== null)
    var articles = newsDiv.selectAll(".article")
    .data(validResults)
    .enter()
    .append("div")
    .attr("class", "article")
    .style("margin", "10px")
    .style("border", "1px solid black")
    .style("border-radius", "0.75rem")
    .style("padding", "10px")

    articles.append("div")
    .attr("class", "title")
    .text((data) => data["title"])
    .style("font-weight", "bold")

    articles.append("div")
    .attr("class", "date")
    .text((data) => data["date"])
    

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
    var [ticker, setTicker] = useState("AAPL");

    useEffect(() => {
        d3.select("select").on("change.news", (value) => {setTicker(value.target.value)});
    }, []);


    useEffect(() => {
        if (!containerRef.current) return;
        var namesFile: string = "/data/stockNews/" + ticker + "/files.csv";
        const {width, height} = containerRef.current.getBoundingClientRect() as ComponentSize;
        d3.csv(namesFile).then((data) => {
            layoutNews(data, width, height, ticker)
        })

    }, [ticker]);

    return (
        <div className = "chart-container d-flex" ref = {containerRef} style = {{width: "100%", height: "100%"}}>
            <div id = "news-div" style = {{width: "100%", height: "100%", overflowY: "auto"}}></div>
        </div>
    );
}