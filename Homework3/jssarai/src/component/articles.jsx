import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

export function Articles(selectedStock) {
  const [articles, setArticles] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    d3.json('../../data/articles.json')
      .then((fileList) => {
        const articleList = fileList[selectedStock.selectedStock] || [];
        setArticles(articleList);
      })
      .catch((err) => {
        console.error('Error loading fileList.json:', err);
      });
  }, [selectedStock]);

    const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  
  return (
    <div className="space-y-4">
      {articles.map((article, i) => (
        <div key={i} className="border p-4 rounded shadow" onClick={() => toggleExpand(i)}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">{article.date}</div>
              <div className="text-lg font-bold">{article.title}</div>
            </div>
          </div>
          {expanded[i] && (
            <div className="mt-4 whitespace-pre-wrap text-gray-700">
              {article.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};