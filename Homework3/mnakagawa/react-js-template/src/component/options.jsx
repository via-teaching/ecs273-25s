import Data from "../../data/demo.json";

export default function RenderOptions() {

    const tickers = [
      "AAPL", "MSFT", "GOOGL", "AMZN", "META",
      "NVDA", "TSLA", "JPM", "V", "UNH",
      "HD", "PG", "DIS", "MA", "PEP",
      "KO", "BAC", "CVX", "XOM", "INTC"
    ];
    // const bars = Data.data;
    return tickers.map((ticker, index) => (
      <option key={index} value={ticker}>
        {ticker}
      </option>
    ));
  }
