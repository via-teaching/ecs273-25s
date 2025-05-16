import React, { useState } from 'react'
import RenderOptions from './component/options'
import StockChartWithSelection from './component/LineChart'
import StockNews from './component/StockList'
import ScatterPlot from './component/Scatter'

export default function App() {
  // ← pull the selected symbol into state
  const [selectedStock, setSelectedStock] = useState('AAPL')

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
      <header className="bg-zinc-400 text-white p-2 flex items-center">
        <h2 className="text-2xl">Homework 3</h2>
        <label htmlFor="stock-select" className="mx-2 flex items-center">
          <span className="mr-2">Select a stock:</span>
          <select
            id="stock-select"
            value={selectedStock}                             // ← controlled value
            onChange={e => setSelectedStock(e.target.value)} // ← updates state
            className="bg-white text-black p-2 rounded"
          >
            {/* ← render your 20 <option> tags */}
            <RenderOptions />
          </select>
        </label>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-row h-full w-full">
        {/* LEFT COLUMN (Views 1 & 2) */}
        <div className="flex flex-col w-2/3 space-y-4 p-2">
          
          {/* View 1 – Stock Price Overview */}
          <div className="border-2 border-gray-300 rounded-xl p-4">
            <h3 className="text-xl mb-2">View 1 – Stock Price Overview Line Chart</h3>
            {/* ← pass the selected stock down as a prop! */}
            <StockChartWithSelection symbol={selectedStock} />
          </div>

          {/* View 2 – TSNE Scatter Plot */}
          <div className="border-2 border-gray-300 rounded-xl p-4 h-[calc(100%_-_2rem)]">
            <h3 className="text-xl mb-2">View 2 – TSNE Scatter Plot</h3>
            <ScatterPlot symbol={selectedStock}/>
          </div>
        </div>

        {/* RIGHT COLUMN (View 3 – Stock News) */}
        <div className="w-1/3 p-2">
          <div className="border-2 border-gray-300 rounded-xl p-4 h-full">
            <h3 className="text-xl mb-2">View 3 – Stock News List</h3>
            <StockNews symbol={selectedStock}/>
          </div>
        </div>
      </div>
    </div>
  )
}
