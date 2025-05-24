import RenderOptions from "./component/options";
import { ScatterPlot } from "./component/scatter";
import { LineChart } from "./component/lines";
import { useEffect, useRef, useState } from "react";
import { NewsFeed } from "./component/news";

function App() {
  const [currentTicker, setCurrentTicker] = useState('AAPL');

  const reportChange = (e) => setCurrentTicker(e.target.value);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 4</h2>
        <label htmlFor="bar-select" className="mx-2">Select a ticker symbol:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" onChange={reportChange}>
              <RenderOptions />
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Open, Low, High, and Closing Prices (Last 2 years)</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              <LineChart ticker={currentTicker}/>
            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">t-SNE 2D Representation</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <ScatterPlot ticker={currentTicker}/>
            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">News About {currentTicker} (click to expand / collapse)</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <NewsFeed ticker={currentTicker}/>
            </div>
          </div>
        
      </div>
    </div>
  )
}

export default App;
