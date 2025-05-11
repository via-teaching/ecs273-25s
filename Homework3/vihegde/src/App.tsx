
import { useState } from "react";
import RenderOptions from "./component/options";
import StockLineChart from "./component/stock_line_chart";
import ScatterPlot from "./component/scatter_plot";
import StockNews from "./component/stock_news";


export default function App() {
  const [selectedStock, setSelectedStock] = useState<string>("AAPL"); // Default stock

  const handleStockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStock(event.target.value);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a category:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" value={selectedStock} onChange={handleStockChange}>
              {RenderOptions()}
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Line Chart for stock {selectedStock}</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              <StockLineChart selectedStock={selectedStock} />
            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">TSNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <ScatterPlot selectedTicker={selectedStock} />
            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">News for {selectedStock}</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <StockNews selectedTicker={selectedStock} />
            </div>
          </div>
        
      </div>
    </div>
    
  );
}
