import { useState, useEffect, ChangeEvent } from "react";
import RenderOptions from "./component/options";
import StockPriceChart from "./component/StockPriceChart";
import TSNEScatter from "./component/TSNEScatter";
import NewsList from "./component/NewsList";

export default function App() {
  const [selectedStock, setSelectedStock] = useState<string>("AAPL");
  const [stockList, setStockList] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/stock_list")
      .then((res) => res.json())
      .then((data: { tickers: string[] }) => {
        if (data.tickers) setStockList(data.tickers);
      })
      // error handling
      .catch((err) => console.error("Failed to fetch stock list:", err));
  }, []);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStock(e.target.value);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 4</h2>
        <label htmlFor="bar-select" className="mx-2">
          Select a stock:
          <select
            id="bar-select"
            className="bg-white text-black p-2 rounded mx-2"
            onChange={handleSelectChange}
            value={selectedStock}
          >
            {stockList.length > 0 ? (
              stockList.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))
            ) : (
              <option disabled>Loading...</option>
            )}
          </select>
        </label>
      </header>

      <div className="flex h-full w-full">
        {/* Left section (Stock Price and t-SNE) */}
        <div className="flex flex-col w-3/4 p-2">
          {/* Stock Price Chart Section */}
          <div className="flex-1 p-2">
            <h3 className="text-left text-xl">Stock Price Over Time</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <StockPriceChart selectedStock={selectedStock} />
            </div>
          </div>

          {/* t-SNE Scatter Plot Section */}
          <div className="flex-1 p-2">
            <h3 className="text-left text-xl">t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <TSNEScatter selectedStock={selectedStock} />
            </div>
          </div>
</div>

        {/* Right section (News List) */}
        <div className="w-1/4 p-2">
          <h3 className="text-left text-xl">Stock News</h3>
          <div className="border-2 border-gray-300 rounded-xl h-full">
            <NewsList selectedStock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  );
}
