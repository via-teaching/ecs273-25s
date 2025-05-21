import { useEffect, useState } from "react";

export function ReadNews({ selectedStock }) {
  const [newsList, setNewsList] = useState([]);
  const [clickedNewsId, setClickedNewsId] = useState(null);

  // Get stock news from database
  useEffect(() => {
    if (!selectedStock) {
      setNewsList([]);
      setClickedNewsId(null);
      return;
    }
    fetch(`http://localhost:8000/stocknews?stock_name=${selectedStock}`)
      .then((res) => res.json())
      .then((data) => {
        setNewsList(data.News || []);
        setClickedNewsId(null);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
        setNewsList([]);
      });
  }, [selectedStock]);

  const handleClick = (id) => {
    setClickedNewsId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="overflow-auto h-full p-2">
      {newsList.length === 0 ? (
        <p className="text-gray-500 text-center">
          No news available for the selected stock.
        </p>
      ) : (
        <ul className="space-y-2">
          {newsList.map(({ _id, title, content }) => (
            <li
              key={_id}
              className="bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 cursor-pointer p-3"
              onClick={() => handleClick(_id)}
            >
              <div className="font-medium text-gray-800 text-base">{title}</div>

              {clickedNewsId === _id && (
                <div className="mt-3 p-3 border rounded-lg bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap">
                  {content}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
