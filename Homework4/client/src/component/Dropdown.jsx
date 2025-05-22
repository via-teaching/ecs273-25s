// src/component/Dropdown.jsx
import React from 'react';

const Dropdown = ({ selected, onChange }) => {
  const stocks = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "XOM", "CVX", "HAL", "MMM", "CAT", "DAL", "MCD", "NKE", "KO", "JNJ", "PFE", "UNH", "JPM", "GS", "BAC"];

  return (
    <select
      className="p-2 border rounded"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {stocks.map(ticker => (
        <option key={ticker} value={ticker}>{ticker}</option>
      ))}
    </select>
  );
};

export default Dropdown;
