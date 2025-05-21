// src/component/NewsList.tsx
import React, { useEffect, useState } from "react";

interface Article {
  Title: string;
  Date: string;
  content: string;
}

interface NewsListProps {
  selectedStock: string;
}

const NewsList: React.FC<NewsListProps> = ({ selectedStock }) => {
  const [newsData, setNewsData] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStock) {
        setNewsData([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/stocknews/?stock_name=${selectedStock}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Now data.news is the array of news objects as returned by backend
        const newsList = data.news || [];

        setNewsData(newsList);
      } catch (error) {
        console.error("Error fetching the news data:", error);
        setNewsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStock]);

  const handleArticleClick = (articleIndex: number) => {
    setSelectedArticle(selectedArticle === articleIndex ? null : articleIndex);
  };

  const newsItemStyle = {
    cursor: "pointer",
    marginBottom: "10px",
    padding: "8px",
    borderBottom: "1px solid #ccc",
  };

  const newsContentStyle = {
    overflow: "hidden",
    transition: "max-height 0.3s ease, opacity 0.3s ease",
    maxHeight: "0",
    opacity: 0,
  };

  const newsContentVisibleStyle = {
    maxHeight: "500px",
    opacity: 1,
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>News for {selectedStock}</h3>
      {loading ? (
        <p>Loading news...</p>
      ) : newsData.length === 0 ? (
        <p>No news available for this stock.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {newsData.map((article, index) => (
            <li
              key={index}
              style={newsItemStyle}
              onClick={() => handleArticleClick(index)}
            >
              <h4>{article.Title}</h4>
              <small>{article.Date}</small>
              <div
                style={
                  selectedArticle === index
                    ? { ...newsContentStyle, ...newsContentVisibleStyle }
                    : newsContentStyle
                }
              >
                <p>{article.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsList;
