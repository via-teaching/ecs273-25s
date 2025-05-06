// import Data from "../../data/demo.json";

// export default function RenderOptions() {
//     const bars = Data.data;
//     return bars.map((bar, index) => (
//       <option key={index} value={bar.category}>
//         {bar.category}
//       </option>
//     ));
//   }


  const stockList = ['BAC', 'HAL', 'CAT', 'MCD', 'MMM',
    'KO', 'MSFT', 'NVDA', 'XOM', 'CVX',
    'NKE', 'GS', 'JPM', 'GOOGL', 'META',
    'PFE', 'DAL', 'UNH', 'AAPL', 'JNJ'];   
  
  export default function RenderOptions() {
    return stockList.map((symbol) => (
      <option key={symbol} value={symbol}>
        {symbol}
      </option>
    ));
  }
  