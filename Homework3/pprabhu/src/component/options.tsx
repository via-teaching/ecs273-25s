export default function RenderOptions() {
  const stocks: string[] = ['XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 
    'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH', 'JPM',
    'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

  return stocks.map((stock, index) => (
    <option key={index} value={stock}>
      {stock}
    </option>
  ));
}