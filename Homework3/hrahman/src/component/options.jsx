import Data from "../../data/demo.json";

export default function RenderOptions({ selectedTicker, setSelectedTicker }) {
  const bars = Data.data;
  return (
    <select
      id="bar-select"
      value={selectedTicker}
      onChange={(e) => setSelectedTicker(e.target.value)}
      className="bg-white text-black p-2 rounded mx-2">
      {bars.map((bar, index) => (<option key={index} value={bar.category}>{bar.category}</option>))}
    </select>
  );
}
