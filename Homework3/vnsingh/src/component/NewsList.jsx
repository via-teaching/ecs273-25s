import { useEffect, useState } from "react";

export  default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  async function fetchArticlesForStock(ticker) {
    if (!ticker) return;

    try {
      const res = await fetch(`data/stocknews/${ticker}/index.json`);
      const filenames = await res.json();

      const news = await Promise.all(
        filenames.map(async (filename) => {
          try {
            const fileRes = await fetch(
              `data/stocknews/${ticker}/${encodeURIComponent(filename)}`
            );
            const rawText = await fileRes.text();
            const lines = rawText.split("\n");

            const title = lines.find((l) => l.startsWith("Title:"))
              ?.replace("Title:", "")
              .trim();
            const date = lines.find((l) => l.startsWith("Date:"))
              ?.replace("Date:", "")
              .trim();
            const url = lines.find((l) => l.startsWith("URL:"))
              ?.replace("URL:", "")
              .trim();
            const contentIndex = lines.findIndex((l) => l.startsWith("Content:"));
            const content = lines.slice(contentIndex + 1).join("\n").trim();

            if (!title || !date) return null;
            return { title, date, url, content };
          } catch {
            return null;
          }
        })
      );

      setArticles(news.filter(Boolean));
    } catch (err) {
      console.error("Failed to load news:", err);
      setArticles([]);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const ordinal =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";

    const formatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
    }).format(date);

    return `${day}${ordinal} ${formatted}`;
  }

  useEffect(() => {
    const attemptLoad = () => {
      const dropdown = document.getElementById("bar-select");
      if (dropdown && dropdown.value) {
        fetchArticlesForStock(dropdown.value);
        return true;
      }
      return false;
    };

    if (attemptLoad()) return;

    const interval = setInterval(() => {
      if (attemptLoad()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dropdown = document.getElementById("bar-select");
    if (!dropdown) return;

    const onChange = () => fetchArticlesForStock(dropdown.value);
    dropdown.addEventListener("change", onChange);
    return () => dropdown.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="overflow-y-auto h-full px-4 py-2">
      <div className="space-y-2">
        {articles.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-4">
            No news articles available for this stock.
          </div>
        ) : (
          articles.map((article, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="border p-2 bg-white rounded-md shadow-sm cursor-pointer"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="text-base font-medium text-blue-700 hover:underline">
                  {article.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatDate(article.date)}
                </div>

                {isExpanded && (
                  <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap bg-orange-100 p-2 rounded-sm border border-orange-300 shadow-inner">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline block mb-1"
                      >
                        View Original Article
                      </a>
                    )}
                    <p>{article.content}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
