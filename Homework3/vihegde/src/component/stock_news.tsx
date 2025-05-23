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
        const fileListResponse = await fetch("/data/stocknews/news_files.json");
        const fileList = await fileListResponse.json();
    
        const files = fileList[selectedTicker] || [];
        const newsFolder = `/data/stocknews/${selectedTicker}/`;
    
        const newsData: NewsData[] = await Promise.all(
          files.map(async (file: any) => {
            const filePath = `${newsFolder}${file}`;
            const response = await fetch(filePath);
    
            // Check if the response is OK
            if (!response.ok) {
              console.error(`Failed to fetch file: ${filePath}`);
              return null;
            }
    
            const fileContent = await response.text();
    
            // Ensure the content is not HTML
            if (fileContent.startsWith("<!doctype html>")) {
              console.error(`Invalid content in file: ${filePath}`);
              return null;
            }
    
            const [titleLine, dateLine, ...contentLines] = fileContent.split("\n");
            const title = titleLine.replace("Title: ", "").trim();
            const date = dateLine.replace("Date: ", "").trim();
            const content = contentLines.join("\n").trim();
            return { title, date, content };
          })
        );
    
        setNews(newsData.filter((item) => item !== null) as NewsData[]);
      } catch (error) {
        console.error("Error fetching news:", error);
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