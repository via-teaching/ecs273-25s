import { useState, useEffect } from "react";
import RenderOptions from "./component/options";
import { LineChart } from "./component/example/view1";
import { ScatterPlot } from './component/example/view2';
import { ReadNews } from "./component/example/view3";

function App() {
  const [selectedStock, setSelectedStock] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch("/data/stocknews/all_file_names.json")
      .then((res) => res.json())
      .then((data) => {
        const names = data.filenamedata.map((d) => d.stock);
        setOptions(names);
        if (!selectedStock) setSelectedStock(names[0]); // default choice
      });
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="stockoption" className="mx-2">
          Select a category:
          <select
            id="stockoption"
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)} // update
            className="bg-white text-black p-2 rounded mx-2"
          >
            {options.map((stock, index) => (
              <option key={index} value={stock}>
                {stock}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">
          <div className="h-2/5 p-2">
            <h3 className="text-left text-xl h-[2rem]">Stock Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <LineChart stock={selectedStock} /> 
            </div>
          </div>

          <div className="h-3/5 p-2">
            <h3 className="text-left text-xl h-[2rem]">TSNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <ScatterPlot stock={selectedStock}/>
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full p-2">
          <h3 className="text-left text-xl h-[2rem]">List of News</h3>
          <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
            <ReadNews selectedStock={selectedStock} /> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
