//import Data from "../../data/demo.json";

import { Bar } from "../types";

// A "extends" B means A inherits the properties and methods from B.
// interface CategoricalBar extends Bar{
//     category: string;
// }


export default function RenderOptions() {
  const stocks: string[] = ['XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 
    'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH', 'JPM',
    'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']


  //const bars: CategoricalBar[] = Data.data;
  return stocks.map((stock, index) => (
    <option key={index} value={stock}>
      {stock}
    </option>
  ));
  }