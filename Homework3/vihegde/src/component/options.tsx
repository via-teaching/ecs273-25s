import StockList from "../../data/stocks.json";

export default function RenderOptions() {
  return StockList.stocks.map((ticker: string, index: number) => (
    <option key={index} value={ticker}>
      {ticker}
    </option>
  ));
}
