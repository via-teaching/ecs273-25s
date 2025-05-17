export default function RenderOptions({ selectedTicker, setSelectedTicker, stockList }) {
  return (
    <select
      id="bar-select"
      value={selectedTicker}
      onChange={(e) => setSelectedTicker(e.target.value)}
      className="bg-white text-black p-2 rounded mx-2">
      {stockList.map((ticker, index) => (
        <option key={index} value={ticker}>
          {ticker}
        </option>
      ))}
    </select>
  );
}