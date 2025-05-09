export default function RenderOptions() {
  const stockTickers = [
    "XOM", "CVX", "HAL", "MMM", "CAT", "DAL", "MCD", "NKE", "KO", "JNJ", "PFE", 
    "UNH", "JPM", "GS", "BAC", "AAPL", "MSFT", "NVDA", "GOOGL", "META"
  ];

  return stockTickers.map((ticker, index) => (
    <option key={index} value={ticker}>
      {ticker}
    </option>
  ));
}
