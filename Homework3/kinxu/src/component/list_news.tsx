import * as d3 from "d3";
import { createContext, useEffect, useRef, useState } from "react";
import { isEmpty, debounce, max } from 'lodash';
import { tickers } from "./options";
import { ComponentSize, Margin } from "../types";


interface NewsArticle {
    title: string
    date: string
    url: string
    content: string
}
function layoutNews(data: DSVRowArray<Point>, width: number, height: number, ticker: string) {
    var news: NewsArticle[] = []

    var newsContainer = d3.select("#news-div").append("div")
    
    for (var i = 0; i < data.length; i++) {
        var name = data[i]["File"]
        var encoded = encodeURIComponent(name);

        var path = "/data/stocknews/" + ticker + "/" + encoded;
        d3.text(path)
        .then((text) => {
            const lines = text.split('\n');
            var title: string = lines[0];
            var date: string = lines[1];
            var url: string = lines[2];
            var content: string = lines.slice(3).join('\n');

            var newsItem = newsContainer.append("div")
            .style("cursor", "pointer")
            .style("border", "1px solid")
            .style("margin-bottom", "10px")

            newsItem.append("div")
            .text(`${title} - ${date}`)
            .style("font-weight", "bold");

            var contentDiv = newsItem.append("div")
            .text(content)
            .style("display", "none")
            .style("margin-top", "10px");

             newsItem.on("click", () => {
                var isVisible = contentDiv.style("display") === "block";
                contentDiv.style("display", isVisible ? "none" : "block");
            });
        })
    }
}


export function ListNews() {
    const containerRef = useRef<HTMLDivElement>(null);
    var [ticker, setTicker] = useState("AAPL")

    useEffect(() => {
        d3.select("select").on("change.news", (value) => {setTicker(value.target.value)});
    }, []);


    useEffect(() => {
        if (!containerRef.current) return;
        // var fileName = "../../data/stockdata/" + ticker + ".csv";
        const resizeObserver = new ResizeObserver(
            debounce((entries: ResizeObserverEntry[]) => {
                for (const entry of entries) {
                    if (entry.target !== containerRef.current) continue;

                    const {width, height} = entry.contentRect as ComponentSize;
                    var namesFile: string = "/data/stockNews/" + ticker + "/files.csv";
                    d3.csv(namesFile).then((data) => {
                        layoutNews(data, width, height, ticker)
                    })
                }
            }, 100)
        );

        resizeObserver.observe(containerRef.current);
        const {width, height} = containerRef.current.getBoundingClientRect();
        return () => resizeObserver.disconnect();
    }, [ticker]);

    return (
        <div className = "chart-container d-flex" ref = {containerRef} style = {{width: "100%", height: "100%", overflowX: "auto"}}>
            <div id = "news-div" style = {{width: "100%", height: "100%"}}></div>
        </div>
    );
}