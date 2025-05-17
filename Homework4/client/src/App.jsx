
import * as d3 from 'd3';
import React, { useState, useEffect } from "react";
import LineChart from "./component/LineChart";
import TSnePlot from "./component/TSnePlot";
import NewsList from "./component/NewsList";

function App() {
  const [selectedStock, setSelectedStock] = useState("CAT");
  const [stockData, setStockData] = useState([]);
  const [tsneData, setTsneData] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);

  // Load stock list
  useEffect(() => {
    fetch("http://localhost:8000/stocklist")
      .then(res => res.json())
      .then(data => setStockOptions(data.tickers))
      .catch(err => {
        console.error("Error loading stock list:", err);
        setStockOptions(["AAPL", "MSFT"]); // fallback
      });
  }, []);

  // Load stock price data
  useEffect(() => {
    fetch(`http://localhost:8000/stockdata/${selectedStock}`)
      .then(res => res.json())
      .then(data => {
        if (!data.date || !data.Open || !data.High || !data.Low || !data.Close) {
          console.error("Invalid stock data response:", data);
          setStockData([]);
          return;
        }

        const length = data.date.length;
        const parsed = [];

        for (let i = 0; i < length; i++) {
          parsed.push({
            date: data.date[i],
            Open: data.Open[i],
            High: data.High[i],
            Low: data.Low[i],
            Close: data.Close[i]
          });
        }

        setStockData(parsed);
      })

      .catch(err => {
        console.error("Error fetching stock data:", err);
        setStockData([]);
      });
  }, [selectedStock]);

  
  // Load stock news
useEffect(() => {
  fetch(`http://localhost:8000/stocknews/?stock_name=${selectedStock}`)
    .then(res => res.json())
    .then(news => {
  const newsItems = news.map(item => {
    // Extract date and clean title from the filename
    const raw = item.Title.replace(".txt", "");
    const [datetime, ...titleParts] = raw.split("_");
    const title = titleParts.join(" ").trim();

    return {
      date: datetime,         // "2025-04-09 16-02"
      title: title,           // Cleaned title
      content: item.content,  // Full article text
    };
  });
  setStockNews(newsItems);
})

}, [selectedStock]);


  // Load t-SNE data
  useEffect(() => {
  fetch("http://localhost:8000/tsne/")
    .then(res => res.json())
    .then((data) => {
      const parsed = data.map(d => ({
        x: d.x,
        y: d.y,
        stock: d.Stock  // Keep track of the stock for coloring
      }));
      setTsneData(parsed);
    })
    .catch((err) => {
      console.error("Failed to fetch t-SNE data:", err);
    });
}, []);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row items-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">
          Select a stock:
          <select
            id="bar-select"
            className="bg-white text-black p-2 rounded mx-2"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            {stockOptions.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">
          <div className="h-1/3 p-2">
            <h3 className="text-left text-xl">Stock Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <LineChart data={stockData} className="w-full h-full" />
            </div>
          </div>

          <div className="h-2/3 p-2 mt-12">
            <h3 className="text-left text-xl">t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <TSnePlot data={tsneData} selectedStock={selectedStock} className="w-full h-full" />
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full p-2">
          <h3 className="text-left text-xl">News List</h3>
          <div className="border-2 border-gray-300 rounded-xl h-full overflow-y-auto">
            <NewsList stockNews={stockNews} selectedStock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
