import { useEffect, useState } from 'react';

export default function RenderOptions() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    // Load tickers from your data folder
    async function loadTickers() {
      try {
        const res = await fetch('/data/tsne.csv');
        const text = await res.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const tickerIndex = headers.indexOf('Ticker');
        
        if (tickerIndex >= 0) {
          const tickers = lines.slice(1)
            .map(line => line.split(',')[tickerIndex])
            .filter(Boolean);
          setTickers(tickers);
        }
      } catch (err) {
        console.error("Failed to load tickers:", err);
        // Fallback to default tickers
        setTickers(['AAPL', 'MSFT', 'NVDA', /*...*/]);
      }
    }

    loadTickers();
  }, []);

  return tickers.map((ticker) => (
    <option key={ticker} value={ticker}>
      {ticker}
    </option>
  ));
}