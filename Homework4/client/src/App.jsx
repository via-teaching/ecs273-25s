import RenderOptions from "./component/options";
import { LineChart } from "./component/linechart";
import { Scatter } from "./component/scatter";
import { Articles } from "./component/articles";

import { useEffect, useState } from 'react';

export default function App() {
  const [stockList, setStockList] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [stockArticles, setStockArticles] = useState([]);
  const [selectedStock, setSelectedStock] = useState('XOM');
  const [TSNE, setTSNE] = useState();

  const handleSelection = (e) => {
    setSelectedStock(e.target.value);
  };

  useEffect(() => {
    fetch('http://localhost:8000/stock_list')
      .then(res => res.json())
      .then(data => setStockList(data.tickers));
    fetch('http://localhost:8000/stock/' + selectedStock)
      .then(res => res.json())
      .then(data => setStockData(data.stock_series))
    fetch('http://localhost:8000/stocknews/' + selectedStock)
      .then(res => res.json())
      .then(data => setStockArticles(data.News))
    fetch('http://localhost:8000/tsne')
      .then(res => res.json())
      .then(data => setTSNE(data.Values))
  }, [selectedStock]);
  
  return (
      <div className="flex flex-col h-full w-full">
        <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
          <h2 className="text-left text-2xl">Homework 4</h2>
          <label htmlFor="bar-select" className="mx-2">Select a category:
            <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" onChange={handleSelection}>
                <RenderOptions stockList={stockList}/>
            </select>
          </label>
        </header>
        <div className="flex flex-row h-full w-full">
          <div className="flex flex-col w-2/3">
  
            <div className="h-1/4 p-2">
              <h3 className="text-left text-xl">{selectedStock} Price History</h3>
              <div className="border-2 border-gray-300 rounded-xl">
                <LineChart selectedStock={selectedStock} stockData={stockData}/>
              </div>
            </div>
            <div className="h-3/4 p-2 mt-2">
              <h3 className="text-left text-xl h-[2rem]">Latent Representation ScatterPlot</h3>
              <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
                <Scatter selectedStock={selectedStock} TSNE={TSNE}/>
              </div>
            </div>
            
          </div>
          <div className="w-1/3 h-full p-2">
              <h3 className="text-left text-xl h-[2rem]">Recent News (Click to Expand)</h3>
              <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
                <Articles selectedStock={selectedStock} stockArticles={stockArticles}/>
              </div>
            </div>
          
        </div>
      </div>
    );
}
