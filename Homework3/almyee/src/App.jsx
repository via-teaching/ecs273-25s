import * as d3 from 'd3';
import React, { useState, useEffect } from "react";
import RenderOptions from "./component/options";
import LineChart from "./component/LineChart";
import TSnePlot from "./component/TSnePlot";
import NewsList from "./component/NewsList";

function App() {
  const [selectedStock, setSelectedStock] = useState("CAT");
  const [stockData, setStockData] = useState([]);
  const [tsneData, setTsneData] = useState([]);
  const [stockNews, setStockNews] = useState([]);
  // const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv(`/data/stockdata/${selectedStock}.csv`).then(data => {
      const parsed = data.map(d => ({
        date: d.Date,
        Open: +d.Open,
        High: +d.High,
        Low: +d.Low,
        Close: +d.Close
      }));
      setStockData(parsed);
    });
  }, [selectedStock]);
  
    useEffect(() => {
      fetch('/data/stocknews/index.json')
        .then((res) => res.json())
        .then((index) => {
          const files = index[selectedStock] || [];
          const newsItems = files.map((fileName) => {
            // Extract title and date from filename
            const [date, ...titleParts] = fileName.replace('.txt', '').split('_');
            const title = titleParts.join(' ');
            return { fileName, date, title };
          });
          setStockNews(newsItems);
        })
        .catch((err) => {
          console.error('Error loading index.json:', err);
          setStockNews([]);
        });
    }, [selectedStock]);
  

    useEffect(() => {
      // Load and clean the data when the component mounts
      d3.csv('/data/tsne.csv').then((rawData) => {
        // Clean the data by converting TSNE1 and TSNE2 to numbers
        const cleanedData = rawData.map(d => ({
          x: parseFloat(d.TSNE1),  // Convert TSNE1 to a number
          y: parseFloat(d.TSNE2),  // Convert TSNE2 to a number
        })).filter(d => !isNaN(d.x) && !isNaN(d.y));  // Filter out invalid points
  
        // Log cleaned data to verify
        console.log("Cleaned Data:", cleanedData);
  
        // Set the cleaned data into state
        setTsneData(cleanedData);
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
            {RenderOptions()}
          </select>
        </label>
      </header>

      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">
          <div className="h-1/3 p-2">
            <h3 className="text-left text-xl">Stock Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full ">
              <LineChart data={stockData} className="w-full h-full"/>
            </div>
          </div>
          {/* <div className="flex flex-col w-2/3 gap-10">
          </div> */}
          <div className="h-2/3 p-2 mt-12">
            <h3 className="text-left text-xl">t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <TSnePlot data={tsneData} selectedStock={selectedStock} className="w-full h-full"/>
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
