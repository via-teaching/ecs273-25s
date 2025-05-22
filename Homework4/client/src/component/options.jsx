import { useEffect, useState } from "react";

export default function RenderOptions() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/stocks')
            .then(res => res.json())
            .then(data => {
                // アルファベット順にソート
                const sortedStocks = data.sort((a, b) => a.ticker.localeCompare(b.ticker));
                setStocks(sortedStocks);
            })
            .catch(console.error);
    }, []);

    return stocks.map(stock => (
        <option key={stock.ticker} value={stock.ticker}>
            {stock.ticker}
        </option>
    ));
}
