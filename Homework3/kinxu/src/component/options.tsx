import * as d3 from "d3";
import Data from "../../data/demo.json";

import { Bar } from "../types";

export const tickers: string[] = ["AAPL", "BAC", "CAT", "CVX", "DAL", "GOOGL",
  "GS", "HAL", "JNJ","JPM", "KO",
  "MCD", "META", "MMM", "MSFT", "NKE",
  "NVDA", "PFE", "UNH", "XOM"];

// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar{
    category: string;
}

export default function RenderOptions() {
    return tickers.map((ticker, index) => (
      <option key = {index} value = {ticker}>
        {ticker}
      </option>
    ));
  }