
export default function RenderStockOptions(stockList) {
    

    
    const stock = stockList
    
    return stock.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ));
  }
