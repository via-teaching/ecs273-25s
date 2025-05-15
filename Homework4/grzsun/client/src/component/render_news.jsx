import { useState, useEffect,useRef } from 'react';
import { isEmpty, debounce } from 'lodash';
const margin = { left: 40, right: 20, top: 20, bottom: 60 };


export function news(stock_name) {
  


    const [text, settext] = useState([]);
    const [title, settitle] = useState([]);
 

    // fetch the content from API
    useEffect(() => {
        fetch('http://localhost:8000/stocknews/?stock_name=' + stock_name)
        .then(response => response.json())
        .then(data =>{
            let content = [] 
            let tmp_title = [] 
            for(let i=0; i<data.length;i++){
                content.push(data[i].content)
                tmp_title.push(data[i].Date + " " + data[i].Title)
              }
            settext(content)
            settitle(tmp_title)
            })
              
      
        },[stock_name]);

    
    
    // process it to make it fit format
    let data = []
    for(let i=0;i<title.length;i++){
      data.push({'title':title[i],"content":text[i]});
    }
    console.log(data)
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



