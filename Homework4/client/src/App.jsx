import { useState } from "react"; 
import RenderOptions from "./component/options";
import { BarChart } from "./component/barchart";
import { ScatterPlot } from "./component/scatterplot";
import NewsList from "./component/news_list";

function App() {
  const [selectedStock, setSelectedStock] = useState("AAPL"); 

  return (
    <div className="flex flex-col h-screen w-full bg-[#e2e8f0]">
      <header>
        <div className="flex">
          <h2>Homework 4</h2>
          <label htmlFor="bar-select">
            <span>Select a stock:</span>
            <select 
              id="bar-select" 
              value={selectedStock} 
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              {RenderOptions()}
            </select>
          </label>
        </div>
      </header>

      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">
          <div className="h-1/4 p-2 flex flex-col">
            <h3 className="text-left text-xl font-normal h-[2rem] mb-2">View 1: Stock Price Bar Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl flex-1 overflow-hidden bg-white">
              <BarChart selectedStock={selectedStock}/> 
            </div>
          </div>

          <div className="h-3/4 p-2 flex flex-col">
            <h3 className="text-left text-xl font-normal h-[2rem] mb-2">View 2: t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl flex-1 overflow-hidden bg-white">
              <ScatterPlot selectedStock={selectedStock}/>
            </div>
          </div>
        </div>

        <div className="w-1/3 p-2 flex flex-col">
          <h3 className="text-left text-xl font-normal h-[2rem] mb-2">View 3: News</h3>
          <div className="border-2 border-gray-300 rounded-xl flex-1 overflow-hidden bg-white">
            <NewsList ticker={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
