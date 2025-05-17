
const tickers = [
 'XOM', 'CVX', 'HAL',  
  'MMM', 'CAT', 'DAL',  
  'MCD', 'NKE', 'KO',  
  'JNJ', 'PFE', 'UNH', 
  'JPM', 'GS', 'BAC',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META' 
]

export default function RenderOptions() {
  return tickers.map((ticker, index) => (
    <option key={index} value={ticker}>
      {ticker}
    </option>
  ));
}


