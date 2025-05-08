const RenderOptions = () => {
  const stocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "TSLA", "NVDA", "JPM", "BAC", "WFC",
    "V", "MA", "DIS", "NFLX", "NKE",
    "KO", "PEP", "PFE", "JNJ", "MRK"
  ];

  return stocks.map((stock) => (
    <option key={stock} value={stock}>{stock}</option>
  ));
};

export default RenderOptions;
5