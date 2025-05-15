//const fileNames = import.meta.glob('../../data/stockdata/*.csv')
//const fileNames = import.meta.glob('/data/stockdata/*.csv')
export default function RenderStockOptions() {
    
    //const stock = ['AAPL', "BAC", "CAT"]

    // let stock = []
    // for (let key in fileNames){
    //   let temp = key.slice(21, key.length)
    //   //console.log(temp)
    //   //console.log(temp.split(".")[0])
    //   stock.push(temp.split(".")[0])
    // }
    
    const stock = ['AAPL', "BAC", "CAT",
      "CVX","DAL","GOOGL","GS","HAL","JNJ",
      "JPM","KO","MCD","META","MMM","MSFT",
      "NKE","NVDA","PFE","UNH","XOM"
    ]
    return stock.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ));
  }
