// src/App.tsx
import React, { useState, useEffect } from 'react'
import RenderOptions      from './component/options'
import StockChartWithSelection from './component/LineChart'
import LineChart from './component/LineChart'
import StockNews         from './component/StockList'
import ScatterPlot       from './component/Scatter'

import * as d3 from 'd3'

interface PricesV2 {
  symbol: string
  stock_series: { date: string; open: number; high: number; low: number; close: number }[]
}

interface RawNews {
  _id: string;
  Stock: string;
  Title: string;
  Date:  string; 
  content: string;
}

interface NewsArticle {
  symbol:  string;
  title:   string;
  date:    Date;
  content: string;
}

interface ScatterDatum {
  x: number
  y: number
  ticker: string
  sector: string
}

export default function App() {
  const [tickers, setTickers]           = useState<string[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [prices, setPrices]             = useState<PricesV2 | null>(null)
  const [news, setNews]                 = useState<NewsArticle[]>([])

  const [tsneData, setTsneData] = useState<ScatterDatum[]>([])
  const API = import.meta.env.PROD ? '' : '/api'

  // 1) Load ticker list once
  useEffect(() => {
    fetch(`${API}/stock_list`)
      .then(res => res.json())
      .then((data: { tickers: string[] }) => {
        setTickers(data.tickers)
        if (!data.tickers.includes(selectedStock)) {
          setSelectedStock(data.tickers[0])
        }
      })
      .catch(console.error)
  }, [])

  // 2) Whenever `selectedStock` changes, fetch prices & news
  useEffect(() => {
    if (!selectedStock) return
    fetch(`${API}/stock/${selectedStock}`)
      .then(res => res.json())
      .then((d: PricesV2) => setPrices(d))
      .catch(console.error)

    // 2) news — note the trailing slash here!
  fetch(`${API}/stocknews/?stock_name=${encodeURIComponent(selectedStock)}`)
    .then(res => {
      if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
      return res.json();
    })
    .then((arr: RawNews[]) => {
      console.log("raw news payload:", arr);
      const parsed: NewsArticle[] = arr.map(r => ({
        symbol:  r.Stock,
        title:   r.Title,
        date:    new Date(r.Date),    // ← parse the ISO string here
        content: r.content
      }));
      console.log("parsed articles:", parsed);
      setNews(parsed);
    })
    .catch(console.error);
}, [selectedStock]);

// useEffect(() => {
//   fetch(`${API}/tsne`)
//     .then(res => {
//       if (!res.ok) throw new Error(`TSNE fetch failed ${res.status}`);
//       return res.json();
//     })
//     .then((arr: { Stock: string; x: number; y: number; sector: string }[]) => {
//       const pts: ScatterDatum[] = arr.map(r => ({
//         x:      r.x,
//         y:      r.y,
//         ticker: r.Stock,
//         sector: r.sector
//       }));
//       console.log("mapped tsneData:", pts);
//       setTsneData(pts);
//     })
//     .catch(console.error);
// }, []);

  // 1) Fetch TSNE data from backend
  useEffect(() => {
    fetch(`${API}/tsne`)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch /tsne failed: ${res.status}`)
        return res.json() as Promise<
          { Stock: string; x: number; y: number; sector: string }[]
        >
      })
      .then(arr => {
        // map backend shape → front-end shape
        const pts = arr.map(r => ({
          x:      r.x,
          y:      r.y,
          ticker: r.Stock,
          sector: r.sector
        }))
        setTsneData(pts)
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
      <header className="bg-zinc-400 text-white p-2 flex items-center">
        <h2 className="text-2xl">Homework 4</h2>
        <label htmlFor="stock-select" className="mx-2 flex items-center">
          <span className="mr-2">Select a stock:</span>
          <select
            id="stock-select"
            value={selectedStock}
            onChange={e => setSelectedStock(e.target.value)}
            className="bg-white text-black p-2 rounded"
          >
            {tickers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-row h-full w-full">
        {/* LEFT COLUMN (Line + Scatter) */}
        <div className="flex flex-col w-2/3 space-y-4 p-2">
          {/* View 1 – Stock Price Overview */}
          <div className="border-2 border-gray-300 rounded-xl p-4">
            <h3 className="text-xl mb-2">View 1 – Stock Price Line Chart</h3>
            {prices
              ? <StockChartWithSelection symbol={selectedStock} data={prices.stock_series} />
              : <p>Loading prices…</p>
            }
          </div>

          {/* View 2 – TSNE Scatter Plot */}
          <div className="border-2 border-gray-300 rounded-xl p-4 h-[calc(100%_-_2rem)]">
            <h3 className="text-xl mb-2">View 2 – TSNE Scatter Plot</h3>
            {tsneData.length > 0
            ? <ScatterPlot symbol={selectedStock} data={tsneData} />
            : <p>Loading TSNE…</p>
            }
          </div>
        </div>

        {/* RIGHT COLUMN (News) */}
        <div className="w-1/3 p-2">
          <div className="border-2 border-gray-300 rounded-xl p-4 h-full overflow-auto">
            <h3 className="text-xl mb-2">View 3 – Stock News List</h3>
            <StockNews
              symbol={selectedStock}
              items={news.map(n => ({
                title:   n.title,
                date:    n.date.toLocaleDateString(),
                content: n.content
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
