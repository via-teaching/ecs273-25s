import { useEffect, useState } from "react";

export function StockNewsList({ selectedStock }) {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const filenames = STOCK_NEWS_FILES[selectedStock] || [];
    Promise.all(
      filenames.map((filename) =>
        fetch(`/data/stocknews/${selectedStock}/${filename}`)
          .then((res) => res.text())
          .then((content) => {
            const [date, ...titleParts] = filename.replace(".txt", "").split("_");
            const title = titleParts.join(" ");
            return {
              date,
              title,
              content,
            };
          })
      )
    )
      .then(setArticles)
      .catch((err) => {
        console.error("Error loading articles:", err);
        setArticles([]);
      });
  }, [selectedStock]);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-xl font-bold mb-4">
        News for {selectedStock}
      </h3>

      {articles.length === 0 && (
        <p className="text-gray-500">No news available.</p>
      )}

      {articles.map((article, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition"
          onClick={() =>
            setExpandedIndex(expandedIndex === index ? null : index)
          }
        >
          <div className="font-semibold text-md">{article.title}</div>
          <div className="text-sm text-gray-500 mb-1">{article.date}</div>

          {expandedIndex === index && (
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              {article.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}