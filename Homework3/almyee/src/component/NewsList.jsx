
import React, { useState } from "react";

export default function NewsList({ stockNews = [], selectedStock }) {  // Default to an empty array
  const [expanded, setExpanded] = useState({});
  const [content, setContent] = useState("");
  // console.log("selectedStock: ", selectedStock)
  const handleArticleClick = (fileName) => {
    fetch(`/data/stocknews/${selectedStock}/${fileName}`)
      .then((res) => res.text())
      .then((text) => {
        setSelectedArticleContent(text);
      });
  };
  
  const toggleExpand = (index, fileName) => {
    // console.log("filename: ", filename)
    if (!expanded[index]) {
      // Fetch the content of the clicked file
      fetch(`/data/stocknews/${selectedStock}/${fileName}`)
        .then((res) => res.text())
        .then((data) => {
          setContent(data); // Set the article content to display
        })
        .catch((error) => {
          console.error("Error fetching article content:", error);
        });
    }
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="p-2">
      {stockNews.length === 0 ? (
        <p className="text-center text-gray-500">No news available</p>
      ) : (
        <ul className="space-y-2">
          {stockNews.map((item, index) => (
            <li key={index} className="border p-2 rounded hover:bg-gray-100">
              <div
                className="cursor-pointer font-semibold"
                onClick={() => toggleExpand(index, item.fileName)}
              >
                {item.title}
              </div>
              <p className="text-sm text-gray-600">{item.date}</p>
              <a href={item.url} className="text-blue-500" target="_blank" rel="noopener noreferrer">
                Read full article
              </a>
              {expanded[index] && <p className="text-sm mt-2">{content}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


