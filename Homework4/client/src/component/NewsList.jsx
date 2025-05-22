import { useEffect, useState } from "react";

export function NewsList({ selectedTicker }) {
  const [newsList, setNewsList] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null); // 控制 modal 內容

  useEffect(() => {
    if (!selectedTicker) return;
    fetch(`http://localhost:8000/news/${selectedTicker}`)
      .then(res => res.json())
      .then(setNewsList)
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setNewsList([]);
      });
  }, [selectedTicker]);

  return (
    <div className="p-4 overflow-y-auto h-full text-sm text-blue-800">
      {newsList.length === 0 && (
        <p className="text-gray-500">No news available.</p>
      )}
      <ul className="space-y-4">
        {newsList.map((article, index) => (
          <li key={index}>
            <p className="font-bold mb-1">
              {article.title}
              <span className="text-xs text-gray-500 ml-2">
                ({article.date})
              </span>
            </p>
            <button
              onClick={() => setSelectedArticle(article)}
              className="text-blue-600 underline hover:text-blue-400"
            >
              Read more
            </button>
          </li>
        ))}
      </ul>

      {/* Modal 彈窗 */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
              onClick={() => setSelectedArticle(null)}
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-2">{selectedArticle.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{selectedArticle.date}</p>
            <pre className="whitespace-pre-wrap text-black">{selectedArticle.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
