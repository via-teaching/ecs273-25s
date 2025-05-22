import React, { useEffect, useState } from "react";

const NewsList = ({ selectedTicker }) => {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    if (!selectedTicker) return;

    fetch(`http://localhost:8000/stocknews/?stock_name=${selectedTicker}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected response format");

        const formatted = data.map((item, idx) => ({
          id: idx,
          title: item.Title || "No title",
          date: item.Date || "Unknown date",
          content: item.content || "",
          expanded: false,
        }));

        setNewsItems(formatted);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
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
