import { useState } from "react"; 
import RenderOptions from "./component/options";
import { BarChart } from "./component/barchart";
import { ScatterPlot } from "./component/scatterplot";
import NewsList from "./component/news_list";
function App() {

  //initial setting = first stock in options
  const [selectedStock, setSelectedStock] = useState("AAPL"); 

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a stock:
          <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2" value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} >
              {RenderOptions()}
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2 flex flex-col">
            <h3 className="text-left text-xl">View 1: Stock Price Bar Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl flex-1 overflow-hidden">
              <BarChart selectedStock={selectedStock}/> 
              {/* I here asked gpt why it needs to be change to <> */}
            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">View 2: t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              {/* <p className="text-center text-gray-500 mt-20">  </p> */}
              <ScatterPlot selectedStock={selectedStock}/>
            
           </div>
          </div>

        </div>
        <div className="w-1/3 h-full p-2 flex flex-col">
            <h3 className="text-left text-xl h-[2rem]">View 3 : News (Please read README)</h3>
            <div className="border-2 border-gray-300 rounded-xl flex-1 overflow-hidden">
              {/* <p className="text-center text-gray-500 mt-20"></p> */}
              <NewsList ticker={selectedStock} />
            </div>
          </div>
        
      </div>
    </div>
  )
}

export default App;
