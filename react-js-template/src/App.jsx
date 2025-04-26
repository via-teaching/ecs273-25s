import RenderOptions from "./component/options";
import { BarChart } from "./component/example";
function App() {
  return (
    <div className="flex flex-col h-full w-full">
          <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
            <h2 className="text-left text-2xl">Homework 3</h2>
            <label htmlFor="bar-select" className="mx-2">Select a category:
              <select id = 'bar-select' className="bg-white text-black p-2 rounded mx-2">
                {RenderOptions()}
              </select>
            </label>
          </header>
          <div className="flex flex-row h-full w-full">
            <div className="flex flex-col w-2/3">
              <div className="border-2 border-gray-300 rounded-xl p-2 h-1/4 m-2">
                {BarChart()}
              </div>
              <div className="border-2 border-gray-300 rounded-xl p-2 h-3/4 m-2">
                <p className="text-center text-gray-500 mt-20">Empty View 2</p>
              </div>
            </div>
            <div className="border-2 border-gray-300 rounded-xl p-2 w-1/3 m-2">
              <p className="text-center text-gray-500 mt-20">Empty View 3</p>
            </div>
          </div>
        </div>
  )
}

export default App;
