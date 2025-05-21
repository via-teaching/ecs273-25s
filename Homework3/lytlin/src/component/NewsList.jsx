import { useEffect, useState } from "react";

export default function NewsList({ stockSymbol }) {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    if (!stockSymbol) return;

    const loadNews = async () => {
      try {
        const res = await fetch(`/data/stocknews/${stockSymbol}/index.json`);
        const index = await res.json();

        const fetched = await Promise.all(
          index.map(async (file) => {
            const url = encodeURI(`/data/stocknews/${stockSymbol}/${file}`);
            const content = await fetch(url).then(r => r.text());

            return { date: file.replace('.txt', ''), content };
          })
        );

        setNewsItems(fetched);
      } catch (err) {
        console.error("Failed to load news for", stockSymbol, err);
        setNewsItems([]);
      }
    };

    loadNews();
  }, [stockSymbol]);
   //search some info from AI

  return (
    <div className="overflow-y-scroll h-full p-2">
      <h4 className="text-xl font-semibold mb-2">News for {stockSymbol}</h4>
      {newsItems.length === 0 ? (
        <p className="text-gray-500">No news available.</p>
      ) : (
        newsItems.map((item, idx) => (
          <details key={idx} className="mb-2">
            <summary className="cursor-pointer text-sm font-medium text-blue-600">
              {item.date}
            </summary>
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          </details>
        ))
      )}
    </div>
  );
}
