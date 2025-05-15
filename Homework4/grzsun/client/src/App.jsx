import RenderStockOptions from "./component/stockoptions";
import get_name from "./component/get_stock_name";
import { LineChart } from "./component/render_graph";
import { ScatterChart } from "./component/render_scatter";
import { news } from "./component/render_news";
import { useEffect, useState } from 'react';

function App() {

  const [stockList, setStockList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/stock_list')
      .then(res => res.json())
      .then(data => setStockList(data.tickers));
  }, []);

  let stock_name = get_name()

  
  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="stock-select" className="mx-2">Select a Stock:
          <select id ='stock-select' className="bg-white text-black p-2 rounded mx-2">
              {RenderStockOptions(stockList)}
          </select>
        </label>
      </header>
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">{stock_name} Overview Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              {LineChart(stock_name)}
            </div>
          </div>
          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">TSNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              
              {ScatterChart(stock_name)}
              {/* <p className="text-center text-gray-500 mt-20">Empty View 2</p> */}
            </div>
          </div>
          
        </div>
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">{stock_name} News</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              {news(stock_name)}
              {/* <p className="text-center text-gray-500 mt-20">Hello</p> */}
            </div>
          </div>
        
      </div>
    </div>
  )
}

export default App;
