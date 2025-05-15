import { useEffect, useState } from "react";
import * as d3 from "d3";

export function NewsPanel({ selectedStock }) {
  const [newsList, setNewsList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [fullContents, setFullContents] = useState({}); 

  useEffect(() => {
    async function fetchNewsIndex() {
      try {
        const indexUrl = `/data/stocknews/${selectedStock}/index.json`;
        const index = await fetch(indexUrl).then(res => res.json());
        setNewsList(index);
        setFullContents({}); 
      } catch (error) {
        console.error("Error loading index:", error);
        setNewsList([]);
      }
    }

    if (selectedStock) fetchNewsIndex();
  }, [selectedStock]);

  const handleToggle = async (index) => {
    if (index === expandedIndex) {
      setExpandedIndex(null);
      return;
    }

    const item = newsList[index];
    if (!fullContents[item.filename]) {
      try {
        const text = await d3.text(`/data/stocknews/${selectedStock}/${item.filename}`);
        setFullContents(prev => ({ ...prev, [item.filename]: text.trim() }));
      } catch (error) {
        console.error("Error loading file:", item.filename, error);
        setFullContents(prev => ({ ...prev, [item.filename]: "[Error loading content]" }));
      }
    }

    setExpandedIndex(index);
  };

  return (
    <div className="news-panel relative max-h-[65vh] border-t border-gray-300 flex flex-col">
      <div className="sticky top-0 z-10 p-2 border-b border-gray-200">
        <h4 className="text-lg font-semibold">News for {selectedStock}</h4>
      </div>


      <div className="overflow-y-auto p-2 flex-grow">
        {newsList.map((news, index) => (
          <div key={index} className="mb-2 border p-2 rounded shadow">
            <div onClick={() => handleToggle(index)} className="cursor-pointer">
              <strong>{news.title}</strong>
              <p className="text-sm text-gray-600">{news.date}</p>
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 underline"
              >
                {news.url}
              </a>
            </div>
            {index === expandedIndex && (
              <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                {fullContents[news.filename] || "Loading..."}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
