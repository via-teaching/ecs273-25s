import Data from "../../data/tickers.json";

export default function RenderOptions() {
    const bars = Data.data;
    return bars.map((bar, index) => (
      <option key={index} value={bar.category}>
        {bar.category}
      </option>
    ));
  }
