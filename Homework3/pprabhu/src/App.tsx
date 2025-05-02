import { useState } from 'react';
import RenderOptions from "./component/options";
import StockLineChart from "./component/StockLineChart";
import Scatterplot from "./component/Scatterplot";
import NewsList from "./component/NewsList";



export default function App() {
  const [selectedStock, setSelectedStock] = useState('XOM'); // Default to AAPL

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStock(e.target.value);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a Stock:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" value={selectedStock} onChange={handleStockChange}>
              {RenderOptions()}
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-7/24 p-2 pb-0">
            <h3 className="text-left text-xl mb-2">Stock Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl">
            <StockLineChart selectedStock={selectedStock} />
            </div>
          </div>
          <div className="h-3/5 p-2 pb-0">
            <h3 className="text-left text-xl mb-1">t-SNE Scatterplot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
            <Scatterplot selectedStock={selectedStock} />
            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-14/15 p-2">
            <h3 className="text-left text-xl mb-2">News List</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_3.6rem)] " >
            <NewsList selectedStock={selectedStock} />
            </div>
          </div>
        
      </div>
    </div>
    
  );
}
