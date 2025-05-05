import RenderOptions from "./component/options";
import { LineChart } from './component/line_chart';
import { NewsArticles } from './component/news_article';
import { TsnePlot } from "./component/scatter_plot";

function App() {
  return (
    <div className="flex flex-col h-full w-full">
      <header className="bg-blue-400 text-black p-1 flex items-center justify-between relative">

  <div className="ml-4 font-semibold">Stock Information</div>
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <label htmlFor="bar-select" className="flex items-center space-x-2">
      <span>Select a Company:</span>
      <select
  id="bar-select"
  className="bg-purple-200 text-black p-1 rounded border border-black"
>
  {RenderOptions()}
</select>

    </label>
  </div>

  <div className="w-24" />
</header>

      <div className="h-2/5  w-full p-1">
        <h3 className="text-center text-xl">Historic Data for Companies</h3>
        <div className="border-2 bg-green-100 border-black rounded-xl h-[calc(100%-1rem)]">
          <LineChart />
        </div>
      </div>

      <div className="h-3/5 flex flex-row w-full">
   
        <div className="w-1/2 p-1 ">
          <h3 className="text-center text-xl p-1 h-[1.7rem]">Scatter Plot</h3>
          <div className="border-2 bg-white border-black rounded-xl h-[calc(100%-2rem)]">
            <TsnePlot />
          </div>
        </div>

        {/* Right: News Articles */}
        <div className="w-1/2 p-1 ">
          <h3 className="text-center text-xl p-1 h-[1.7rem]">Related News Articles</h3>
          <div className="border-2 bg-blue-200 border-black rounded-xl h-[calc(100%-2rem)] overflow-auto p-2">
            <NewsArticles />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
