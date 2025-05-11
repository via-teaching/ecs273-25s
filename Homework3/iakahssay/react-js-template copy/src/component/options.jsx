import Data from "../../data/demo.json";

/*
Replace the list in the drop-down menu with 20 different stocks you queried in Homework 1 (modify in src/component/option). (5 pts)
For each view, please add a tsx or jsx file in ‘src/component/’
*/
export default function RenderOptions() {
    
    const stockList = ['XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 
      'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH', 'JPM', 'GS', 'BAC', 
      'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'];


    return stockList.map((symbol, index) => (
      <option key={index} value={symbol}>
        {symbol}
      </option>
    ));

    /*
    const bars = Data.data;

    return bars.map((bar, index) => (
      <option key={index} value={bar.category}>
        {bar.category}
      </option>
    ));
    */
  }
