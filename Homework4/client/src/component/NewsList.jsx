import React, { useState } from "react";

export default function NewsList({ stockNews = [] }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
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
                onClick={() => toggleExpand(index)}
              >
                {item.title}
              </div>
              <p className="text-sm text-gray-600">{item.date}</p>
        
              {expanded[index] && (
                <p className="text-sm mt-2 text-gray-800">{item.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

