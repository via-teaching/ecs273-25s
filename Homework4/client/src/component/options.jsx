import { useEffect, useState } from 'react';

export default function RenderOptions() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    async function loadTickers() {
      try {
        const res = await fetch('http://localhost:8000/stock_list');
        const data = await res.json();
        if (data && data.tickers) {
          setTickers(data.tickers);
        }
      } catch (err) {
        console.error("Failed to load tickers from backend:", err);
        // Optional fallback
        setTickers(['AAPL', 'MSFT', 'NVDA']);
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
