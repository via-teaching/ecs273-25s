import RenderOptions from "./component/options";
import { StockLineChart } from "./component/stock_line_chart";
import { TSNEScatterPlot } from "./component/tsne_scatter_plot";
import { StockNewsList } from "./component/stock_news_list";
import { useEffect, useState } from "react";

function App() {
  const [selectedStock, setSelectedStock] = useState("XOM");
  const [stockList, setStockList] = useState([]);

   useEffect(() => {
    fetch("http://localhost:8000/stock_list")
      .then((res) => res.json())
      .then((data) => setStockList(data.tickers))
      .catch((err) => {
        console.error("[ERROR] Error fetching stock list:", err);
      });
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 4</h2>

        <label htmlFor="stock-select" className="mx-2">Select a stock:
          <select
            id="stock-select"
            className="bg-white text-black p-2 rounded mx-2"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            <RenderOptions stockList={stockList} />
          </select>
        </label>

      </header>


      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">

          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Stock Line Charts</h3>
            <div className="border-2 border-gray-300 rounded-xl">
              <StockLineChart selectedStock={selectedStock} />
            </div>
          </div>

          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">TSNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <TSNEScatterPlot selectedStock={selectedStock} />
            </div>
          </div>
        </div>
        
        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]">Stock News</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <StockNewsList selectedStock={selectedStock} />
            </div>
            
        </div>
        
      </div>
    </div>
  )
}

export default App;