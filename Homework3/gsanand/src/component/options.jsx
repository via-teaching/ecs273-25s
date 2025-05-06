import { useEffect, useState } from "react";

export default function RenderOptions() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    async function fetchTickers() {
      try {
        const res = await fetch("data/stockdata_json/stocklist.json");
        const data = await res.json();
        setTickers(data);
      } catch (error) {
        console.error("Failed to load stock list", error);
      }
    }
    fetchTickers();
  }, []);

  return (
    <>
      {tickers.map((ticker, index) => (
        <option key={index} value={ticker}>
          {ticker}
        </option>
      ))}
    </>
  );
}
