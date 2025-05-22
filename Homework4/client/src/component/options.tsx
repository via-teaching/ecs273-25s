// export default function RenderOptions({stockList}: { stockList: string[] }) {
//   return stockList.map((name, index) => (
//     <option key={index} value={name}>
//       {name}
//     </option>
//   ));
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