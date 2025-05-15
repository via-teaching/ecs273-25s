// import Data from "../../data/demo.json";
const stocks = ["xom", "cvx", "hal", "mmm", "cat", "dal","mcd","nke","ko","jnj","pfe","unh","jpm","gs","bac","aapl","msft","nvda","googl","meta"]
export default function RenderOptions() {
    //const bars = Data.data;
    return stocks.map((stock, index) => (
      <option key={index} value={stock} selected={stock === "xom"}>
        {stock}
      </option>
    ));
  }
