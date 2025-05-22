import RenderOptions from "./component/options";
import { TSNEScatter } from "./component/TSNEScatter";
import { LineChart } from "./component/LineChart";
import { useState } from "react";
import {NewsList} from "./component/NewsList";

function App() {
  const [selectedCompany, setSelectedCompany] = useState("");

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a company:
          <select 
            id = 'bar-select' 
            className="bg-white text-black p-2 rounded mx-2"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <RenderOptions />
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">View 1 to be replaced by the view title</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              {BarChart()}
            </div>
          </div>
          <div className="h-1/2 p-2">
          <h3 className="text-left text-xl h-[2rem]">TSNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)] overflow-hidden">
              <TSNEScatter selectedTicker={selectedCompany} />
            </div>
          </div>
          
        </div>
        <div className="w-1/3 p-2 flex flex-col">
          <h3 className="text-left text-xl h-[2rem]">Stock News</h3>
          <div className="flex-1 border-2 border-gray-300 rounded-xl overflow-y-auto max-h-[calc(100%-2rem)]">
            <NewsList selectedTicker={selectedCompany} />
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default App;
