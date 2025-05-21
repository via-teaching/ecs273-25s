import { useEffect, useState } from "react";

export function StockNewsList({ selectedStock }) {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!selectedStock) {
    setArticles([]);
    return;
  }

  fetch(`http://localhost:8000/stock_news/?stock_name=${selectedStock}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`[ERROR] Failed to fetch news for ${selectedStock}`);
        }
        return res.json();
      })
      .then((data) => {
        // Assuming each item has { Date, Title, Content } fields
        const formatted = data.map((item) => ({
          date: item.Date,
          title: item.Title,
          content: item.Content,
        }));
        setArticles(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[ERROR] Error loading articles:", err);
        setError(err.message || "Unknown error");
        setArticles([]);
        setLoading(false);
      });
  }, [selectedStock]);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-xl font-bold mb-4">
        News for {selectedStock}
      </h3>

      {loading && <p>Loading news...</p>}
      {error && <p className="text-red-500">[ERROR] Error Loading from MongoDB: {error}</p>}

      {!loading && !error && articles.length === 0 && (
        <p className="text-gray-500">No news available.</p>
      )}

      {!loading &&
      !error && 
      articles.map((article, index) => (
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
