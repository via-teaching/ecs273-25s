import { useState } from "react";
import RenderOptions from "./component/options";
import StockOverview from "./component/StockOverview";
import TsneScatter from "./component/TsneScatter";
import NewsList from "./component/NewsList";

function App() {
  const [selectedStock, setSelectedStock] = useState("GOOGL");

  return (
    <div className="flex flex-col h-full w-full bg-blue-50 text-blue-900">
      <header className="bg-blue-100 text-blue-900 p-2 flex items-center border-b border-gray-300">
        <h2 className="text-left text-2xl font-semibold">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-4 flex items-center">
          <span className="mr-2">Select a category:</span>
          <select
            id="bar-select"
            className="bg-white text-blue-900 p-2 border border-blue-300 rounded"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            {RenderOptions()}
          </select>
        </label>
      </header>

      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3 bg-blue-50">
          <div className="h-1/4 p-4">
            <h3 className="text-left text-xl text-gray-900 mb-2">Stock Overview (Line Chart)</h3>
            <div className="border-2 border-blue-200 rounded-xl bg-white p-2">
              <StockOverview selectedStock={selectedStock} />
            </div>
          </div>
          <div className="h-3/4 p-4">
            <h3 className="text-left text-xl text-gray-900 mb-2 h-[2rem]">t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl bg-white h-[calc(100%_-_2rem)] p-2">
              <TsneScatter selectedStock={selectedStock} />
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full p-4 bg-blue-50">
          <h3 className="text-left text-xl text-gray-900 mb-2 h-[2rem]">News List</h3>
          <div className="border-2 border-gray-300 rounded-xl bg-white h-[calc(100%_-_2rem)] overflow-y-auto p-2">
            <NewsList selectedStock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

