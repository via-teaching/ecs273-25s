import React, { useEffect, useState } from "react";

const NewsList = ({ selectedStock }) => {
  const [newsData, setNewsData] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/news.json");
        const data = await response.json();
        setNewsData(data[selectedStock] || []);
      } catch (error) {
        console.error("Error fetching the news data:", error);
      }
    };

    if (selectedStock) {
      fetchData();
    }
  }, [selectedStock]);

  const handleArticleClick = (articleIndex) => {
    // toggle between showing and hiding the article content
    setSelectedArticle(selectedArticle === articleIndex ? null : articleIndex);
  };

  // inline style objects
  const newsListStyle = {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    margin: "20px",
  };

  const headingStyle = {
    fontSize: "1.8em",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  };

  const newsItemStyle = {
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "all 0.3s ease",
  };

  const newsPreviewStyle = {
    cursor: "pointer",
    padding: "15px",
    backgroundColor: "#6c757d", // neutral gray color
    color: "white",
    borderRadius: "8px",
    fontSize: "1.2em",
    fontWeight: "bold",
    textTransform: "uppercase",
    transition: "background-color 0.3s ease",
  };

  const newsPreviewTextStyle = {
    fontSize: "0.9em",
    marginTop: "5px",
    color: "#dcdcdc",
  };

  const newsContentStyle = {
    padding: "15px",
    backgroundColor: "#f1f1f1",
    borderTop: "1px solid #ccc",
    color: "#333",
    fontSize: "1em",
    lineHeight: "1.6",
    maxHeight: selectedArticle ? "1000px" : "0", // toggling max height
    opacity: selectedArticle ? 1 : 0, // fading in/out
    overflow: "hidden",
    transition: "max-height 0.5s ease-out, opacity 0.3s ease-out", // smooth transition
  };

  return (
    <div style={newsListStyle}>
      <h3 style={headingStyle}>News for {selectedStock}</h3>
      <ul>
        {newsData.length === 0 ? (
          <p>No news available for this stock.</p>
        ) : (
          newsData.map((article, index) => (
            <li
              key={index}
              style={newsItemStyle}
            >
              <div
                onClick={() => handleArticleClick(index)} // handle article click
                style={newsPreviewStyle}
              >
                <h4>{article.title}</h4>
                <p style={newsPreviewTextStyle}>{article.date}</p>
              </div>
              <div style={{ ...newsContentStyle, maxHeight: selectedArticle === index ? "1000px" : "0", opacity: selectedArticle === index ? 1 : 0 }}>
                <p>{article.content}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NewsList;
