import { useEffect, useState } from "react";

export default function RenderOptions() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/stock_list")
      .then((res) => res.json())
      .then((data) => setOptions(data.tickers || []))
      .catch((err) => {
        console.error("Failed to fetch stock list:", err);
        setOptions([]);
      });
  }, []);

  return options.map((ticker) => (
    <option key={ticker} value={ticker}>
      {ticker}
    </option>
  ));
}
