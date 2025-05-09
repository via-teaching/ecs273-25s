import { useEffect, useState } from "react";

export default function StockNewsList({ selectedTicker }) {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const folderPath = `/data/stocknews/${selectedTicker}`;
    

    fetch(`${folderPath}/index.json`)
      .then((res) => res.json())
      .then((fileList) => {
        const fetches = fileList.map((file) =>
          fetch(`${folderPath}/${encodeURIComponent(file)}`)
            
            .then((res) => res.text())
            .then((text) => ({ filename: file, content: text }))
        );
        return Promise.all(fetches);
      })
      .then(setArticles)
      .catch((err) => {
        console.error("Error loading news files:", err);
        setArticles([]);
      });
  }, [selectedTicker]);

  return (
    <div className="overflow-y-auto p-2 h-full">
      {articles.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No news available</p>
      ) : (
        articles.map((article, i) => {
          const titleMatch = article.content.match(/Title:\s*(.+)/);
          const dateMatch = article.content.match(/Date:\s*(.+)/);
          const urlMatch = article.content.match(/URL:\s*(.+)/);
          const contentStart = article.content.indexOf("Content:");
          const content = contentStart !== -1
            ? article.content.slice(contentStart + 8).trim()
            : "No content available.";

          const title = titleMatch ? titleMatch[1].trim() : article.filename;
          const date = dateMatch ? dateMatch[1].trim() : "Unknown date";
          const url = urlMatch ? urlMatch[1].trim() : null;
          const isExpanded = expandedIndex === i;

          return (
            <div
              key={i}
              className="mb-3 p-2 border border-gray-300 rounded-lg shadow-sm bg-white"
            >
              <div
                className="cursor-pointer font-semibold text-blue-800"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
                {title}
                <span className="text-sm text-gray-500 ml-2">({date})</span>
              </div>

              {isExpanded && (
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {url && (
                    <p className="mb-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        [View Original Article]
                      </a>
                    </p>
                  )}
                  <p>{content}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
