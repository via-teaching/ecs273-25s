import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";


export default function NewsList({ ticker }) {
    const [articles, setArticles] = useState([]);
    const containerRef = useRef(null);

        useEffect(() => {
            if (!ticker) return;
            
            // I initially try to glob all the files -> filter stock news -> readNewsFiles(), but it doesn't work in my enviorment (URL mod.. error?)
            // I tried to debug by changing the pass, but the /data cannot be found, but I wanted to this dynamic programming
            // so I created server.cjs to grab the files 
            // please refer to  the README to run the server ( `node server.cjs`  in the separate terminal)

            fetch(`http://localhost:3001/api/news/${ticker}`) 
                .then(res => res.json())
                .then(files => {

                    return Promise.all(
                        files.map(file =>
                          fetch(`http://localhost:3001${file.url}`)
                            .then(res => {
                              if (res.ok) {
                                return res.text();
                              } else {
                                console.warn("Fetch failed:", file.url);
                                return "";
                              }
                        })
                        .then(text => readNewsFile(text))
                    ));

              })
                .then(fileContents => {
                  const all = fileContents.flat()
                      .sort((a, b) => b.date - a.date);
                  console.log(all);  
                  setArticles(all);
                })
                .catch(console.error);
        
              }, [ticker]);
            
       

return (
  // I asked GPT to help me debugging this (css)
  <div ref={containerRef} className="overflow-y-auto h-full w-full p-1">
    {articles.length === 0 ? (
      <p className="text-center text-gray-500 mt-10">No local news for {ticker}</p>
    ) : (
      articles.map(a => (
        <details key={a.title + a.date} className="border border-gray-300 rounded-lg p-3">
           <summary className="cursor-pointer flex items-start gap-2">
            <div className="text-sm text-gray-500 min-w-[7rem]">
              {a.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
            <div className="font-medium">{a.title}</div>
          </summary>
          <p className="mt-2 text-sm whitespace-pre-line">{a.content}</p>
          {a.url && (
            <a href={a.url} target="_blank" rel="noopener noreferrer"
               className="text-blue-600 underline text-sm">
               Read full article
            </a>
          )}
        </details>
      ))
    )}
  </div>
);
}


function readNewsFile(text) {

  const blocks = text.split(/\r?\n\s*\r?\n/);
    const news = [];

    blocks.forEach(b => {
      const lines = b.trim().split(/\r?\n/);
      if (lines.length < 4) return;

      const titleLine = lines.find(line => line.startsWith("Title:"));
      const dateLine = lines.find(line => line.startsWith("Date:"));
      const urlLine = lines.find(line => line.startsWith("URL:"));
      const contentIndex = lines.findIndex(line => line.startsWith("Content:"));

      if (!titleLine || !dateLine || contentIndex === -1) return;

      const title = titleLine.slice(6).trim();
      const dateStr = dateLine.slice(5).trim();
      const url = urlLine ? urlLine.slice(4).trim() : null;
      const content = lines.slice(contentIndex + 1).join("\n").trim();

      news.push({
        title,
        date: new Date(dateStr),
        url,
        content,
    });
  });
 
    return news;
}
  

