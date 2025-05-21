// import Data from "../../data/demo.json";

const tickers = [ 
  'XOM', 'CVX', 'HAL',
  'MMM', 'CAT', 'DAL',
  'MCD', 'NKE', 'KO',
  'JNJ', 'PFE', 'UNH',
  'JPM', 'BAC', 'GS',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

export default function RenderOptions() {
  /* 
    const bars = Data.data;
    return bars.map((bar, index) => (
      <option key={index} value={bar.category}>
        {bar.category}
      </option>
    ));
    */
   
   
   return tickers.map((stock, index) => (
     <option key={index} value={stock}>
       {stock}
     </option>
   ));



  }
