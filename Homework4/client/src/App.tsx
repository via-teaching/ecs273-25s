import RenderOptions from "./component/options";
import { useEffect, useState, ChangeEvent } from 'react';
import NewsList from "./component/NewsList";
import { StockLineChart } from "./component/StockLineChart";
import TSNEScatter from "./component/TSNEScatter";
export default function App() {
  const [stockList, setStockList] = useState<string[]>([]);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>("AAPL");


  useEffect(() => {
    fetch('http://localhost:8000/stock_list')
      .then(res => res.json())
      .then(data => setStockList(data));
  }, []);
  
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStockSymbol(event.target.value);
  };


  return (
      <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 4</h2>
        <label htmlFor="bar-select" className="mx-2">
          Select a stock:
          <select
            id="bar-select"
            className="bg-white text-black p-2 rounded mx-2"
            value={selectedStockSymbol}
            onChange={handleChange}
          >
            <RenderOptions stockList={stockList} />
          </select>
        </label>
      </header>


      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Stock overview line chart</h3>
            <div className="border-2 border-gray-300 rounded-xl">
            <StockLineChart stockSymbol={selectedStockSymbol} />
            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">Tsne scatter plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <TSNEScatter selectedSymbol={selectedStockSymbol} />
            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">List of news</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
            <NewsList stockSymbol={selectedStockSymbol} />
            </div>
          </div>
        
      </div>
    </div>
    
  );
}
