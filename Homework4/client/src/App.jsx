import { useState } from 'react';
import RenderOptions from "./component/options";
import { LineChart } from './component/line_chart';
import { NewsArticles } from './component/news_lists';
import { TsneScatter } from "./component/tsne_plot";

function App() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL'); // Default to first ticker

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-zinc-400 text-white p-2 flex flex-row items-center">
        <h2 className="text-left text-2xl">Homework 4</h2>
        <label htmlFor="stock-select" className="mx-2">Select a stock:
          <select 
            id="stock-select" 
            className="bg-white text-black p-2 rounded mx-2"
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
          >
            {RenderOptions()}
          </select>
        </label>
      </header>

      <div className="flex flex-row flex-grow overflow-hidden">
        <div className="flex flex-col w-2/3">
          <div className="h-1/4 p-2">
            <h3 className="text-left text-xl">Line Chart</h3>
            <div className="border-2 border-gray-300 rounded-xl h-full">
              <LineChart selectedTicker={selectedTicker} />
            </div>
          </div>

          <div className="h-3/4 p-2">
            <h3 className="text-left text-xl h-[2rem]">t-SNE Scatter Plot</h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <TsneScatter selectedTicker={selectedTicker} />
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full p-2">
          <h3 className="text-left text-xl h-[2rem]">News Articles</h3>
          <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)] overflow-auto">
            <NewsArticles selectedTicker={selectedTicker} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;