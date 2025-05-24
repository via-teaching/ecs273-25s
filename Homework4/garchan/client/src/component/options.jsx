import { useEffect, useState } from "react";

export default function RenderOptions() {
    const [stockList, setStockList] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/stock_list")
            .then((res) => res.json())
            .then((data) => setStockList(data.tickers));       
    }, []);


    return stockList.map((stock, index) => (
        <option key={index} value={stock}>
            {stock}
        </option>
    ));
}
