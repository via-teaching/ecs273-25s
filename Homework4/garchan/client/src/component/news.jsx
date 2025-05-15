import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 20, top: 20, bottom: 60};
let openIndex = -1;

export function NewsFeed({ticker}){
    const [articleList, setArticleList] = useState([]);
 
    useEffect(() => {
        fetch(`http://localhost:8000/stocknews?stock_name=${ticker}`)
            .then((res) => res.json())
            .then((data) => setArticleList(data.News));
        
    }, [ticker]);
    
    return (
        <div className="newsfeed">
            {articleList.map((article, index) => (
                <div key={index} id={`article-${index}`} className="article-wrapper">
                    <div className="article-header" onClick={() => showHideArticles(index)}>
                        <h3>{article.Title}</h3>
                        <h4>Date: {article.Date}</h4>
                    </div>
                    <p id={`article-content-${index}`} className="article-content" style={{visibility: "hidden", display: "none"}}>{article.content}</p>
                </div>
            ))}
        </div>
    )
}

function showHideArticles(index){
    console.log(index);
    
    if(index == openIndex){
        openIndex = -1;
        d3.select(`#article-content-${index}`)
            .style('visibility', 'hidden')
            .style('display', 'none')
    } else {
        openIndex = index;
        d3.selectAll('.article-content')
            .style('visibility', 'hidden')
            .style('display', 'none')
        d3.select(`#article-content-${index}`)
            .style('visibility', 'visible')
            .style('display', 'block')
    }
    
}

