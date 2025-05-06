import { useEffect, useState } from "react";

export function NewsArticles() {
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

            const title = lines.find((line) => line.startsWith("Title:"))?.replace("Title:", "").trim();
            const date = lines.find((line) => line.startsWith("Date:"))?.replace("Date:", "").trim();
            const url = lines.find((line) => line.startsWith("URL:"))?.replace("URL:", "").trim();
            const contentIndex = lines.findIndex((line) => line.startsWith("Content:"));
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

    const onChange = () => {
      fetchArticlesForStock(dropdown.value);
    };

    dropdown.addEventListener("change", onChange);
    return () => dropdown.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="overflow-y-scroll max-h-full px-4 py-2 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="relative border-l-2 border-red-500 pl-6 space-y-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => setExpandedIndex(index === expandedIndex ? null : index)}
          >
            <span className="absolute left-[-1.9rem] top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-red-10 shadow z-10" />

            <span className="absolute left-0.1 top-[0.875rem] w-6 border-t-2 border-black-400" />

            <div className="ml-10">
              <div className="text-sm font-medium text-gray-800">
                {formatDate(article.date)}
              </div>
              <div className="text-md text-blue-700 hover:underline">
                {article.title}
              </div>

              {expandedIndex === index && (
                <div className="mt-2 text-sm text-black whitespace-pre-wrap bg-orange-100 p-2 rounded border-2 shadow-inner">
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block mb-2"
                    >
                    
                    </a>
                  )}
                  {article.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-sm text-gray-500 text-center mt-4">
            No news articles available for this stock.
          </div>
        )}
      </div>
    </div>
  );
}
