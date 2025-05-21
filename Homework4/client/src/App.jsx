import RenderOptions from "./component/options";
import { BarChart } from "./component/example";
import { Figure1_linechart } from "./component/Figure1_linechart";
import {Figure2_scatterplot } from "./component/Figure2_scatterplot";
import {Figure3_news } from "./component/Figure3_news";

import { useEffect, useState } from 'react';


function App() {
  
  // const [stockList, setStockList] = useState<string[]>([]);
  // i used llm to help syntax to convert tsx from sample file to jsx
  const [stockList, setStockList] = useState([]); 

  useEffect(() => {
    fetch('http://localhost:8000/stock_list')
      .then(res => res.json())
      .then(data => setStockList(data.tickers));
  }, []);
    
  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 4</h2>
        <label htmlFor="bar-select" className="mx-2">Select a category:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2">
              {/* {RenderOptions()} */}
              <RenderOptions stockList={stockList} />

          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Part 1: Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              {/* {Figure1_linechart()} */}
              <Figure1_linechart />

            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">Part 2: Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              {/* <p className="text-center text-gray-500 mt-20">Empty View 2</p> */}
              {/* {Figure2_scatterplot()} */}
              <Figure2_scatterplot />

            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">Part 3: List of News</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              {/* <p className="text-center text-gray-500 mt-20">Empty View 3</p> */}
              {/* {Figure3_news()} */}
              <Figure3_news />

            </div>
          </div>
        
      </div>
    </div>
  )
}

export default App;
