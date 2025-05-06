import { useState, useEffect,useRef } from 'react';
import { isEmpty, debounce } from 'lodash';
const margin = { left: 40, right: 20, top: 20, bottom: 60 };


const AAPL = import.meta.glob('../../data/stocknews/AAPL/*.txt');
const BAC = import.meta.glob('../../data/stocknews/BAC/*.txt');
const CAT = import.meta.glob('../../data/stocknews/CAT/*.txt');
const CVX = import.meta.glob('../../data/stocknews/CVX/*.txt');
const DAL = import.meta.glob('../../data/stocknews/DAL/*.txt');
const GOOGL = import.meta.glob('../../data/stocknews/GOOGL/*.txt');
const GS = import.meta.glob('../../data/stocknews/GS/*.txt');
const HAL = import.meta.glob('../../data/stocknews/HAL/*.txt');
const JNJ = import.meta.glob('../../data/stocknews/JNJ/*.txt');
const JPM = import.meta.glob('../../data/stocknews/JPM/*.txt');
const KO = import.meta.glob('../../data/stocknews/KO/*.txt');
const MCD = import.meta.glob('../../data/stocknews/MCD/*.txt');
const META = import.meta.glob('../../data/stocknews/META/*.txt');
const MSFT = import.meta.glob('../../data/stocknews/MSFT/*.txt');
const NKE = import.meta.glob('../../data/stocknews/NKE/*.txt');
const NVDA = import.meta.glob('../../data/stocknews/NVDA/*.txt');
const PFE = import.meta.glob('../../data/stocknews/PFE/*.txt');
const UNH = import.meta.glob('../../data/stocknews/UNH/*.txt');
const XOM = import.meta.glob('../../data/stocknews/XOM/*.txt');

export function news(stock_name) {
  

  
    // get file_names in directory
    const file_names = [];
    if (stock_name == 'AAPL'){for (const path in AAPL) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'BAC'){for (const path in BAC) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'CAT'){for (const path in CAT) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'CVX'){for (const path in CVX) {file_names.push(path.split("/")[5]);}}  
    if (stock_name == 'DAL'){for (const path in DAL) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'GOOGL'){for (const path in GOOGL) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'GS'){for (const path in GS) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'HAL'){for (const path in HAL) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'JNJ'){for (const path in JNJ) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'JPM'){for (const path in JPM) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'KO'){for (const path in KO) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'MCD'){for (const path in MCD) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'META'){for (const path in META) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'MSFT'){for (const path in MSFT) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'NKE'){for (const path in NKE) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'NVDA'){for (const path in NVDA) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'PFE'){for (const path in PFE) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'UNH'){for (const path in UNH) {file_names.push(path.split("/")[5]);}}
    if (stock_name == 'XOM'){for (const path in XOM) {file_names.push(path.split("/")[5]);}}

    const [text, settext] = useState([]);
    //let path = `http://localhost:5173/data/stocknews/AAPL/${encodeURIComponent("2025-04-14 20_30_The Dow and S&P 500 rise slightly, but tariff and recession fears linger.txt")}`
    
  
    // let path = '../../data/stocknews/KO/2025-04-12 07_05_1 Magnificent High Yield Stock Down 33\% to Buy and Hold Forever.txt'
    // console.log(path)  
    // fetch(path)
    //       .then(response => response.text())
    //       .then(text => {
    //           console.log(text)
    //           let tmp = text.split("\n").slice(3).join("")
    //           //console.log(tmp)
    //       })
        

    // fetch the content in the directory and load them into text array
    useEffect(() => {
        if (typeof stock_name === 'undefined') return;  
        if (typeof file_names === 'undefined') return;
    
        

        for(const index in file_names){
        //let path = "../../data/stocknews/" + stock_name + "/" + file_names[index]
        settext([])
        let path = "";
        if (file_names[index].includes("%")){path = `http://localhost:5173/data/stocknews/${stock_name}/${encodeURIComponent(file_names[index])}`}
        else{path = `../../data/stocknews/${stock_name}/${file_names[index]}`}
        //console.log(path)
        fetch(path)
            .then(response => response.text())
            .then(text => {
                //console.log(text)
                let tmp = text.split("\n").slice(3).join("")
                //console.log(tmp)
                settext(previous => [...previous,tmp]);
              })
        }



      
        },[stock_name]);


    // clean the file title
    let cleaned = []
    for(const idx in file_names){cleaned.push(file_names[idx].split('.')[0]);}
    
    // change to json 
    let data = []
    for(let i=0;i<cleaned.length;i++){
      data.push({'title':cleaned[i],"content":text[i]});
    }

    // get the height and collapse prev expanded
    const [maxheight, setmaxheight] = useState(480);
    const containerRef = useRef(null);

  
  
      useEffect(() => {

          if (!containerRef.current) return;

          // collapse all if select another ticker
          const details_element = containerRef.current.querySelectorAll('details');
          details_element.forEach(detail => {detail.open = false;});

          const resizeObserver = new ResizeObserver(
          debounce((entries) => {
              for (const entry of entries) {
                  if (entry.target !== containerRef.current) continue;
                  const { width, height } = entry.contentRect;
                  if (width && height && !isEmpty(stock_name)) {
                    setmaxheight(height)
                
                  }
              }
          }, 100)
          );
  
          resizeObserver.observe(containerRef.current);
          const { width, height } = containerRef.current.getBoundingClientRect();
          if (width && height) {setmaxheight(height)}
  
      return () => resizeObserver.disconnect();
    }, [stock_name]);
  


    // return the html for summary and content
    return (

    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
    <div style={{
      maxHeight: maxheight,         
      overflowY: 'auto',          
    }}>
      {data.map((item,i) => (
        <details key={i}>
          <summary>{item.title}</summary>
          <p>{item.content}</p>
        </details>
      ))}
    </div>
    </div>
  );
}



