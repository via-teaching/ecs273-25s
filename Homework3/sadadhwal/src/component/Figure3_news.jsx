import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';
import Data from "../../data/demo.json";

// im hardcodeing the tickers rather tahn creating data.json file since prof mentioned in class to student this is fine
const tickers = [ 
  'XOM', 'CVX', 'HAL',
  'MMM', 'CAT', 'DAL',
  'MCD', 'NKE', 'KO',
  'JNJ', 'PFE', 'UNH',
  'JPM', 'BAC', 'GS',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]
  
export function Figure3_news() {
  const containerRef = useRef(null);
  const newsIndexRef = useRef(null);

  const curr_stock_selected = useRef('AAPL');
  const expandedNewsIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
  
    const filter_stock_selected = d3.select('#bar-select');
    const curr_stock = filter_stock_selected.property('value');
  
    curr_stock_selected.current = curr_stock;
    loadNewsIndex();
  
    const handleSelectChange = function(event) {
      const gotten_stock_val = event.target.value;
      curr_stock_selected.current = gotten_stock_val;
      sync_data_to_chart(gotten_stock_val);
    };
  
    filter_stock_selected.on('change.figure3', handleSelectChange);
  
    return () => {
      filter_stock_selected.on('change.figure3', null);
    };
  }, []);

  const loadNewsIndex = () => {
    const indexPath = "/data/map_news_data.json";
    
    fetch(indexPath)
      .then((res) => res.json())
      .then((data) => {
        newsIndexRef.current = data;
        sync_data_to_chart(curr_stock_selected.current);
      });
  };

  const sync_data_to_chart = (stock) => {
    const newsFiles = newsIndexRef.current[stock];
    
    if (!newsFiles || newsFiles.length === 0) {
      showNoNewsMessage(stock);
      return;
    }

    const stockPath = `/data/stocknews/${stock}`;
    const newsPromises = newsFiles.map((filename) => {
      const filePath = `${stockPath}/${encodeURIComponent(filename)}`;
      return fetch(filePath)
        .then((res) => res.text())
        .then((content) => {
          const { date, title } = parseFilename(filename);
          return { id: filename, date, title, content };
        });
    });

    Promise.all(newsPromises)
      .then((results) => {
        results.sort((a, b) => b.date - a.date);
        createNewsList(results);
      });
  };

  const parseFilename = (filename) => {
    const [dateStr, timeStr, ...titleParts] = filename.replace(".txt", "").split("_");
    const dateTimeStr = `${dateStr}T${timeStr.replace("-", ":")}:00`;
    const date = new Date(dateTimeStr);
    const title = titleParts.join(" ").replace(/-/g, " ").replace(/\*/g, "");
    return { date, title };
  };

  const showNoNewsMessage = (stock) => {
    d3.select(containerRef.current).selectAll("*").remove();
    d3.select(containerRef.current)
      .append("div")
      .style("text-align", "center")
      .style("padding", "20px")
      .text(`No news available for ${stock}.`);
  };

  const createNewsList = (newsData) => {
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const newsList = container
      .append("ul")
      .style("list-style", "none")
      .style("padding", "0")
      .style("margin", "0")
      .style("max-height", "100%")
      .style("overflow-y", "auto");

    const newsItems = newsList
      .selectAll(".news-item")
      .data(newsData)
      .enter()
      .append("li")
      .attr("class", "news-item")
      .style("margin-bottom", "10px")
      .style("padding", "10px")
      .style("background-color", "#f8f8f8")
      .style("border-radius", "4px")
      .style("box-shadow", "0 1px 3px rgba(0,0,0,0.1)")
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        expandedNewsIdRef.current = expandedNewsIdRef.current === d.id ? null : d.id;
        updateExpandedItem();
      });

    const newsHeaders = newsItems.append("div")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("margin-bottom", "5px");

    newsHeaders.append("div")
      .style("font-weight", "bold")
      .text((d) => d.title);

    newsHeaders.append("div")
      .style("font-size", "12px")
      .style("color", "#666")
      .text((d) => d.date.toLocaleDateString());

    newsItems.append("div")
      .attr("class", "news-content")
      .style("max-height", "0")
      .style("overflow", "hidden")
      .style("transition", "max-height 0.3s ease")
      .text((d) => d.content);

    updateExpandedItem();
  };

  const updateExpandedItem = () => {
    const container = d3.select(containerRef.current);

    container.selectAll(".news-content")
      .style("max-height", (d) => d.id === expandedNewsIdRef.current ? "500px" : "0");
  };

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%', padding: '10px' }} />
  );
}