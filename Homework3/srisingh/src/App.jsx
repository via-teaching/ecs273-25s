import React, { useState } from 'react';
import Dropdown from './component/Dropdown';
import LineChart from './component/LineChart';
import TSNEPlot from './component/TSNEPlot';
import NewsList from './component/NewsList';

function App() {
  const [selectedStock, setSelectedStock] = useState("AAPL");

  return (
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Visualizer</h1>
        <Dropdown selected={selectedStock} onChange={setSelectedStock} />
      </header>
      <div className="grid grid-cols-3 gap-4 px-4 py-6 h-[calc(100vh-100px)]">
       {/* Left side: occupies 2/3 width */}
       <div className="col-span-2 space-y-4">
        <LineChart ticker={selectedStock} />
        <TSNEPlot selectedTicker={selectedStock} />
       </div>

       {/* Right side: news */}
       <div className="h-full">
        <NewsList selectedTicker={selectedStock} />
       </div>
     </div>
    </div>
  );
}

export default App;

