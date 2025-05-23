import React, { useEffect, useState } from "react";

interface NewsData {
  title: string;
  date: string;
  content: string;
}

interface StockNewsProps {
  selectedTicker: string;
}

const StockNews: React.FC<StockNewsProps> = ({ selectedTicker }) => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!selectedTicker) return;

      try {
        const response = await fetch(`http://localhost:8000/stocknews/${selectedTicker}`);
        if (!response.ok) {
          console.error(`Failed to fetch news for stock: ${selectedTicker}`);
          setNews([]);
          return;
        }

        const data = await response.json();

        // Map the API response to the expected format
        const formattedNews = data.News.map((item: any) => ({
          title: item.Title,
          date: item.Date,
          content: item.content,
        }));

        setNews(formattedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([]);
      }
    };

    fetchNews();
  }, [selectedTicker]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div
      className="stock-news"
      style={{
        height: "100%",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {news.length === 0 ? (
        <p>No news available for the selected stock.</p>
      ) : (
        <ul className="news-list">
          {news.map((item, index) => (
            <li key={index} className="news-item" style={{ marginBottom: "15px" }}>
              <div
                className="news-preview"
                onClick={() => toggleExpand(index)}
                style={{ cursor: "pointer", marginBottom: "10px" }}
              >
                <strong>{item.title}</strong>
                <br />
                <small>{item.date}</small>
              </div>
              {expandedIndex === index && (
                <div className="news-content" style={{ marginTop: "10px" }}>
                  <p>{item.content}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockNews;