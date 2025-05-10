import { useState } from "react";
import RenderOptions from "./component/options";
import StockLineChart from "./component/StockLineChart";
import TSNEScatterPlot from "./component/TSNEScatterPlot";
import StockNewsList from "./component/StockNewsList";

// function App() {
//   const [selectedTicker, setSelectedTicker] = useState("AAPL");
//   return (
//     <div className="flex flex-col h-full w-full">

//       {/* <header className="bg-indigo-500 text-white p-2 flex flex-row items-center">
//         <h2 className="text-left text-2xl"><b><u>Homework 3</u></b></h2>
//         <label htmlFor="bar-select" className="mx-3"><b><em>Select a Stock:</em></b></label>
//         <RenderOptions selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker}/>
//       </header> */}

//       <header className="bg-indigo-500 text-white p-2 flex flex-row items-center justify-between shadow-md">
//         <div className="flex flex-col">
//           <h2 className="text-3xl font-bold tracking-wide">Homework 3</h2>
//           <p className="text-sm text-indigo-100">ECS 273 - Visual Analytics | Shaik Haseeb Ur Rahman</p>
//         </div>
//         <div className="flex flex-col items-end">
//           <label htmlFor="bar-select" className="text-base font-bold mb-1 text-white">Select a Stock</label>
//           <RenderOptions selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker} />
//         </div>
//       </header>
      
//       <div className="flex flex-row h-full w-full">
//         <div className="flex flex-col w-2/3">
//           {/* <div className="h-1/2 p-2">
//             <h3 className="text-xl font-medium text-gray-900 mb-2"><u>Stock Overview Line Chart</u></h3>
//             <div className="border-2 border-gray-300 rounded-xl">
//               <StockLineChart selectedTicker={selectedTicker} />
//             </div>
//           </div> */}
          
//           <div className="h-1/4 p-2">
//             <h3 className="text-xl font-medium text-gray-900 mb-2"><u>Stock Overview Line Chart</u></h3>
//             <div className="border-2 border-gray-300 rounded-xl">
//               <StockLineChart selectedTicker={selectedTicker} />
//             </div>
//           </div>

//           <div className="h-3/4 p-2">
//             <h3 className="text-xl font-medium text-gray-900 mb-2 h-[2rem]"><u>TSNE scatter plot</u></h3>
//             <div className="border-2 border-gray-300 rounded-xl h-[calc(100%)]">
//               {/* <p className="text-center text-gray-500 mt-20">Empty View 2</p> */}
//               <TSNEScatterPlot selectedTicker={selectedTicker} />
//             </div>
//           </div>

//           {/* <div className="h-1/3 p-2">
//             <h3 className="text-xl font-medium text-gray-900 mb-2 h-[2rem]"><u>TSNE scatter plot</u></h3>
//             <div className="border-2 border-gray-300 rounded-xl h-[calc(100%)]">
//               {/* <p className="text-center text-gray-500 mt-20">Empty View 2</p>
//               <TSNEScatterPlot selectedTicker={selectedTicker} />
//             </div>
//           </div> */}

//         </div>
       
//        <div className="w-1/3 h-full p-2">
//             <h3 className="text-xl font-medium text-gray-900 mb-2 h-[2rem]"><u>News List</u></h3>
//             <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
//               <StockNewsList selectedTicker={selectedTicker} />
//             </div>
//           </div>
//       </div>
//     </div>
//   )
// }


function App() {
  
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  
  return (
    <div className="flex flex-col h-full w-full">
      
      {/* <header className="bg-zinc-400 text-white p-2 flex flex-row align-center">
        <h2 className="text-left text-2xl">Homework 3</h2>
        <label htmlFor="bar-select" className="mx-2">Select a Stock:
          <RenderOptions selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker}/>
        </label>
      </header> */}

<header className="bg-indigo-500 text-white p-2 flex flex-row items-center justify-between shadow-md">
  {/* Left: Title */}
  <div className="flex flex-col">
    <h2 className="text-3xl font-bold tracking-wide">Homework 3</h2>
    <p className="text-sm text-indigo-100">ECS 273 - Visual Analytics</p>
  </div>

  {/* Center: Stock Selector */}
  <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
    <label htmlFor="bar-select" className="text-base font-bold mb-1 text-white">
      <b>Select a Stock :</b>
      <RenderOptions selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker} />
    </label>
  </div>

  {/* Right: Haseeb */}
  <div className="text-lg font-bold pr-2">
    <h4 className="text-xl font-bold tracking-wide">Shaik Haseeb Ur Rahman</h4>
    <p className="float-right text-sm text-indigo-100">UID: 924142853</p>
  </div>
</header>

      
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col w-2/3">
          <div className="h-1/2 p-2">
            <h3 className="text-left text-xl"><b>[View 1] Stock Overview Line Chart</b></h3>
            <div className="border-2 border-gray-300 rounded-xl">
              <StockLineChart selectedTicker={selectedTicker} />
            </div>
          </div>
          
          <div className="h-2/3 p-2">
            <h3 className="text-left text-xl h-[2rem]"><b>[View 2] TSNE scatter plot</b></h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <TSNEScatterPlot selectedTicker={selectedTicker} />
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full p-2">
            <h3 className="text-left text-xl h-[2rem]"><b>[View 3] News List</b></h3>
            <div className="border-2 border-gray-300 rounded-xl h-[calc(100%_-_2rem)]">
              <p className="text-center text-gray-500 mt-20">Empty View 3</p>
            </div>
        </div>
      </div>

    </div>
  )
}

export default App;