import { useEffect, useState } from "react";

export function NewsArticles({ selectedTicker }) {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchArticlesForStock(ticker) {
    if (!ticker) {
      setArticles([]);
      return;
    }
  
    setLoading(true);
    setError(null);
    setArticles([]);
  
    try {
      const res = await fetch(`http://localhost:8000/stocknews/?stock_name=${ticker}`);
      if (!res.ok) throw new Error(`No news found for ${ticker}`);
  
      const data = await res.json();
      const loadedArticles = data.News || [];
  
      // Sort by date (newest first)
      loadedArticles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      setArticles(loadedArticles);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load news:", err);
    } finally {
      setLoading(false);
    }
  }
  

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  useEffect(() => {
    fetchArticlesForStock(selectedTicker);
  }, [selectedTicker]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-2">
      <div className="relative border-l-2 border-gray-200 pl-6 space-y-6">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div 
              key={`${article.Date}-${index}`}
              className="relative group cursor-pointer"
              onClick={() => setExpandedIndex(index === expandedIndex ? null : index)}
            >
              {/* Timeline dot */}
              <div className="absolute left-[-1.4rem] top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow z-10" />
              
              {/* Timeline line */}
              <div className="absolute left-[-0.5rem] top-5 bottom-0 w-px bg-gray-300" />

              <div className="ml-4 pb-4">
                <div className="text-xs font-medium text-gray-500">
                  {formatDate(article.Date)}
                </div>
                <div className="text-md font-semibold text-gray-800 hover:text-blue-600">
                  {article.Title}
                </div>

                {expandedIndex === index && (
                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block mb-2"
                      >
                        Read full article ↗
                      </a>
                    )}
                    <div className="whitespace-pre-line text-gray-600">
                      {article.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic p-4">
            {selectedTicker ? "No news articles available" : "Select a stock to view news"}
          </div>
        )}
      </div>
    </div>
  );
}