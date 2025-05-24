import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';
import Data from "../../data/news.json"

const margin = { left: 40, right: 20, top: 20, bottom: 60};
const newsJSON = Data.data;
let openIndex = -1;

async function getNews(ticker, fileName) {
    let text = await d3.text(`../../data/stocknews/${ticker}/${fileName}`);
    let dateIndex = 0;
    let contentIndex = 0;
    for(let i = 0; i < text.length; i++){
        if(text[i] === '\n' && dateIndex == 0){
            dateIndex = i;
        } else if(text[i] === '\n'){
            contentIndex = i;
        }
    }

    const articleInfo = {
        "title": text.slice(7, dateIndex),
        "date": text.slice(dateIndex+28, dateIndex+38),
        "content": text.slice(dateIndex+45)
    };

    return articleInfo;
}

export function NewsFeed({ticker}){
    const [articleList, setArticleList] = useState([]);
 
    useEffect(() => {
        // Do something when ticker changes
        const work = async () => {
            const tickerFiles = newsJSON[ticker];
            const promises = tickerFiles.map((f) => getNews(ticker, f))
            // Wait for all articles to be processed
            const articles = await Promise.all(promises);
            setArticleList(articles); 
        } 
        work();           
    }, [ticker])
    
    return (
        <div className="newsfeed">
            {articleList.map((article, index) => (
                <div key={index} id={`article-${index}`} className="article-wrapper">
                    <div className="article-header" onClick={() => showHideArticles(index)}>
                        <h3>{article.title}</h3>
                        <h4>Date: {article.date}</h4>
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

