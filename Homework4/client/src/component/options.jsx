// from thhe TSX samole file:
// export default function RenderOptions({stockList}: { stockList: string[] }) {
//   return stockList.map((name, index) => (
//     <option key={index} value={name}>
//       {name}
//     </option>
//   ));
//   }


export default function RenderOptions({ stockList }) {
  return stockList.map((name, index) => (
    <option key={index} value={name}>
      {name}
    </option>
  ));
}
  
