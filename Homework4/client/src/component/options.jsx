/*
Replace the list in the drop-down menu with 20 different stocks you queried in Homework 1 (modify in src/component/option). (5 pts)
For each view, please add a tsx or jsx file in ‘src/component/’
*/
export default function RenderOptions({stockList}) {
  return stockList.map((symbol, index) => (
    <option key={index} value={symbol}>
      {symbol}
    </option>
  ));
}

