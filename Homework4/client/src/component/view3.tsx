import { useEffect, useState } from "react";

interface NewsItem {
  Title: string;
  Date: string;
  content: string;
  url?: string; // optional if stored in DB
}

interface NewsPanelProps {
  selectedStock: string;
}

export function NewsPanel({ selectedStock }: NewsPanelProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const apiUrl = `http://localhost:8000/stocknews/?stock_name=${selectedStock}`;
        const result = await fetch(apiUrl).then(res => res.json());

        if (Array.isArray(result)) {
          setNewsList(result);
        } else {
          setNewsList([]);
        }
      } catch (error) {
        console.error("Error fetching news from API:", error);
        setNewsList([]);
      }
    }

    if (selectedStock) fetchNews();
  }, [selectedStock]);


  const handleToggle = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div className="news-panel relative max-h-[65vh] border-t border-gray-300 flex flex-col">
      <div className="sticky top-0 z-10 p-2 border-b border-gray-200 ">
        <h4 className="text-lg font-semibold">News for {selectedStock}</h4>
      </div>

      <div className="overflow-y-auto p-2 flex-grow">
        {newsList.map((news, index) => (
          <div key={index} className="mb-2 border p-2 rounded shadow">
            <div onClick={() => handleToggle(index)} className="cursor-pointer">
              <strong>{news.Title}</strong>
              <p className="text-sm text-gray-600">{news.Date}</p>
              {news.url && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 underline"
                >
                  {news.url}
                </a>
              )}
            </div>
            {index === expandedIndex && (
              <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                {news.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
