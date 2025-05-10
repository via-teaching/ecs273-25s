import Data from "../../data/demo.json";

export default function RenderOptions() {
    const bars = Data.data;

    const stockList = ['XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 
      'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH', 'JPM', 'GS', 'BAC', 
      'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'];

  /*return bars.map((bar, index) => (
      <option key={index} value={bar.category}>
        {bar.category}
      </option>
    ));
    */

    return stockList.map((symbol, index) => (
      <option key={index} value={symbol}>
        {symbol}
      </option>
    ));
  }
