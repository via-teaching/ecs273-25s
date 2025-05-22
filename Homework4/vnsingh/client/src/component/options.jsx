const RenderOptions = () => {
  const stocks = [
    "AAPL", "BAC", "CAT", "CVX", "DAL",
    "GOOGL", "GS", "HAL", "JNJ", "JPM",
    "KO", "MCD", "META", "MMM", "MSFT",
    "NKE", "NVDA", "PFE", "UNH", "XOM"
  ];

  return stocks.map((stock) => (
    <option key={stock} value={stock}>{stock}</option>
  ));
};

export default RenderOptions;
