import { useState, useEffect } from 'react';
import {RenderOptions} from "./component/options";
import StockLineChart from "./component/StockLineChart";
import Scatterplot from "./component/Scatterplot";
import NewsList from './component/NewsList';

export default function App() {
  const [stockList, setStockList] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('XOM');

  useEffect(() => {
    fetch('http://localhost:8000/stock_list')
      .then(res => res.json())
      .then(data => {
        setStockList(data.tickers);
      })
      .catch(err => {
        console.error('Error fetching stock list:', err);
      });
  }, []);

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStock(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Stock Data Analysis</h2>
        <label htmlFor="bar-select" className="mx-2">Select a Stock:
          <select id='bar-select' className="bg-white text-black p-2 rounded mx-2" value={selectedStock} onChange={handleStockChange}>
              <RenderOptions stockList={stockList} />
          </select>
        </label>
      </header>
      <div className="flex flex-row flex-grow w-full overflow-auto">
        <div className="flex flex-col w-2/3">
          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Stock Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              <StockLineChart selectedStock={selectedStock} />
            </div>
          </div>
          <div className="h-3/5 p-2">
            <h3 className="text-left text-xl h-[2rem]">t-SNE Scatterplot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <Scatterplot selectedStock={selectedStock} />
            </div>
          </div>
        </div>
        <div className="w-1/3 h-14/15 p-2">
          <h3 className="text-left text-xl h-[2rem]">News List</h3>
          <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_3.6rem)]">
            <NewsList selectedStock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
}
