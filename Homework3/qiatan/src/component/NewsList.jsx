import { useEffect, useState } from "react";

const NewsList = ({ selectedStock }) => {
  const [newsList, setNewsList] = useState([]);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    fetch(`/data/stocknews/${selectedStock}/news.json`)
      .then(res => res.json())
      .then(data => setNewsList(data))
      .catch(() => setNewsList([]));
  }, [selectedStock]);

  return (
    <div className="overflow-y-auto h-full p-2">
      {newsList.length === 0 ? (
        <p className="text-center text-gray-500">No news found for {selectedStock}</p>
      ) : (
        newsList.map((news, idx) => (
          <div
            key={idx}
            className="border-b py-2 cursor-pointer"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className="font-medium">{news.title}</div>
            <div className="text-gray-500 text-sm">{news.date}</div>
            {expandedIdx === idx && (
              <div className="mt-2 text-gray-700">{news.content}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NewsList;
