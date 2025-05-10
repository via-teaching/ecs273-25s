// src/component/NewsList.jsx
import React, { useEffect, useState } from 'react';

function NewsList({ selectedStock }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!selectedStock) return;

    const indexUrl = `/data/stocknews/${selectedStock}/index.json`;

    fetch(indexUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load index.json for ${selectedStock}`);
        }
        return res.json();
      })
      .then(async (files) => {
        const fetchedArticles = await Promise.all(
          files.map(async (filename) => {
            const fileUrl = `/data/stocknews/${selectedStock}/${encodeURIComponent(filename)}`;
            const response = await fetch(fileUrl);
        
            if (!response.ok) {
              console.error(`Missing file: ${fileUrl}`);
              return { title: 'Missing File', date: 'N/A', url: '', content: `File ${filename} not found.` };
            }
            const txt = await response.text();

            const lines = txt.split('\n');

            const title = lines.find((line) => line.startsWith('Title:'))?.replace('Title:', '').trim() ?? 'Untitled';
            const date = lines.find((line) => line.startsWith('Date:'))?.replace('Date:', '').trim() ?? 'Unknown Date';
            const urlLink = lines.find((line) => line.startsWith('URL:'))?.replace('URL:', '').trim() ?? '';


            const urlIndex = lines.findIndex((line) => line.startsWith('URL:'));
            const content = urlIndex >= 0
              ? lines.slice(urlIndex + 1).join('\n').trim()
              : lines.join('\n').trim();

            return { title, date, url: urlLink, content };
          })
        );
        setArticles(fetchedArticles);
      })
      .catch((error) => {
        console.error('Error loading news list:', error);
        setArticles([]); // fallback to empty if error
      });
  }, [selectedStock]);

  return (
    <div>
      {articles.length === 0 ? (
        <p className="text-center text-gray-500">No articles found for {selectedStock}.</p>
      ) : (
        articles.map((art, idx) => (
          <details key={idx} className="border-b p-2">
            <summary className="font-bold cursor-pointer">
              {art.title} ({art.date})
            </summary>
            <p className="text-sm text-blue-500 mb-1">
              <a href={art.url} target="_blank" rel="noopener noreferrer">{art.url}</a>
            </p>
            <p className="whitespace-pre-wrap">{art.content}</p>
          </details>
        ))
      )}
    </div>
  );
}

export default NewsList;
