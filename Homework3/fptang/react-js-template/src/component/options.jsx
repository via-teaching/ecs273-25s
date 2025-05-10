// import Data from "../../data/demo.json";

// export default function RenderOptions() {
//     const bars = Data.data;
//     return bars.map((bar, index) => (
//       <option key={index} value={bar.category}>
//         {bar.category}
//       </option>
//     ));
//   }

import React from 'react'

export const symbols = [
  "AAPL","BAC","CAT","CVX","DAL",
  "GOOGL","GS","HAL","JNJ","JPM",
  "KO","MCD","META","MMM","MSFT",
  "NKE","NVDA","PFE","UNH","XOM"
]

export default function RenderOptions() {
  return symbols.map(sym => (
    <option key={sym} value={sym}>
      {sym}
    </option>
  ))
}
