import React, { useEffect, useState } from "react";

const NewsList = ({ selectedTicker }) => {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    if (!selectedTicker) return;

    const folderPath = `/data/stocknews/${selectedTicker}`;

    fetch(`${folderPath}/files.json`)
      .then(async (res) => {
        const text = await res.text();
        if (text.trim().startsWith("<!DOCTYPE html")) throw new Error("Invalid JSON response");
        return JSON.parse(text);
      })
      .then((files) =>
        Promise.all(
          files.map((filename) =>
            fetch(`${folderPath}/${encodeURIComponent(filename)}`)
              .then((res) => res.text())
              .then((content) => {
                const lines = content
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean);

                const title = lines.find((line) => line.startsWith("Title:"))?.replace("Title: ", "");
                const date = lines.find((line) => line.startsWith("Date:"))?.replace("Date: ", "");

                if (!title || !date) return null; 

                return {
                  id: filename,
                  title,
                  date,
                  url: lines.find((line) => line.startsWith("URL:"))?.replace("URL: ", "") || "",
                  content: lines.slice(3).join("\n"),
                  expanded: false,
                };
              })
              .catch(() => null)
          )
        )
      )
      .then((newsArray) => {
        const validNews = newsArray.filter(Boolean);
        setNewsItems(validNews);
      })
      .catch((err) => {
        console.error("Error loading news:", err);
        setNewsItems([]);
      });
  }, [selectedTicker]);

  const toggleItem = (id) => {
    setNewsItems((items) =>
      items.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item))
    );
  };

  return (
    <div className="rounded-2xl shadow-md p-4 bg-white border border-gray-300 h-[1015px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">News for {selectedTicker}</h2>
      {newsItems.length === 0 ? (
        <p className="text-gray-500">No news found.</p>
      ) : (
        <ul className="space-y-2">
          {newsItems.map((item) => (
            <li
              key={item.id}
              className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-500">{item.date}</div>
              {item.expanded && (
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {item.content}
                  {item.url && (
                    <div className="mt-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Read more
                      </a>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsList;
