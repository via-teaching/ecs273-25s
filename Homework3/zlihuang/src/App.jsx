import RenderOptions from "./component/options";
import { useState } from "react";
// import { BarChart } from "./component/example";
import { LineChart } from "./component/view1";
import { ScatterPlot} from "./component/view2";
import { NewsPanel } from "./component/view3";
function App() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a category:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
              {RenderOptions()}
          </select>
        </label>
      </header>
      <div className="p-2 w-full">
        <h3 className="text-left text-xl">Stock overview line chart</h3>
        <div className="border-2 border-gray-300 rounded-xl w-full">
          <LineChart selectedStock={selectedStock} />
        </div>
      </div>

      <div className="flex flex-row h-full w-full">
        <div className="w-2/3 p-2">
          <h3 className="text-left text-xl h-[2rem]">tsne scatter plot</h3>
          <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
            <ScatterPlot selectedStock={selectedStock} />
          </div>
        </div>

        <div className="w-1/3 p-2">
          <h3 className="text-left text-xl h-[2rem]">list of news</h3>
          <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
            <NewsPanel selectedStock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
