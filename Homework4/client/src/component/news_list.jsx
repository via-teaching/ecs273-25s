import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export default function NewsList({ ticker }) {
    const [articles, setArticles] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!ticker) return;
        
        fetch(`http://localhost:8000/api/stocks/${ticker}/news`)
            .then(res => res.json())
            .then(data => {
                setArticles(data);
            })
            .catch(console.error);
    }, [ticker]);

    return (
        <div ref={containerRef} className="overflow-y-auto h-full w-full p-1">
            {articles.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No news for {ticker}</p>
            ) : (
                articles.map((a, index) => (
                    <div key={a.title + a.date}>
                        <details className="group p-3 hover:bg-gray-50 transition-colors duration-150">
                            <summary className="cursor-pointer flex items-start gap-2 relative">
                                <span className="toggle-icon text-gray-100 text-lg">
                                    ❯
                                </span>
                                <div className="text-sm text-gray-500 min-w-[7rem]">
                                    {new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </div>
                                <div className="font-medium group-hover:text-blue-600 transition-colors duration-150">{a.title}</div>
                            </summary>
                            {a.content && (
                                <div className="mt-2 whitespace-pre-line text-sm text-gray-600 pl-[8.5rem] animate-fadeIn">
                                    {a.content}
                                    {a.url && (
                                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 underline">
                                            Read more
                                        </a>
                                    )}
                                </div>
                            )}
                        </details>
                        {index < articles.length - 1 && (
                            <div className="mx-6 border-b border-gray-200" />
                        )}
                    </div>
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
  

