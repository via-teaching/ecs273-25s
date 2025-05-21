import { useEffect, useState } from "react";

type NewsItem = {
  date: string;
  title: string;
  content: string;
};

type NewsListProps = {
  stockSymbol: string;
};

export default function NewsList({ stockSymbol }: NewsListProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (!stockSymbol) return;

    const loadNews = async () => {
      try {
        const res = await fetch(`http://localhost:8000/stocknews/${stockSymbol}`);
        const data = await res.json();

        const formatted: NewsItem[] = data.map((item: any) => ({
          date: new Date(item.Date).toLocaleString(), 
          title: item.Title,
          content: item.Content,
        }));

        setNewsItems(formatted);
      } catch (err) {
        console.error("Failed to load news for", stockSymbol, err);
        setNewsItems([]);
      }
    };

    loadNews();
  }, [stockSymbol]);

  return (
    <div className="overflow-y-scroll h-full p-2">
      <h4 className="text-xl font-semibold mb-2">News for {stockSymbol}</h4>
      {newsItems.length === 0 ? (
        <p className="text-gray-500">No news available.</p>
      ) : (
        newsItems.map((item, idx) => (
          <details key={idx} className="mb-2">
            <summary className="cursor-pointer text-sm font-medium text-blue-600">
              {item.date} - {item.title}
            </summary>
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          </details>
        ))
      )}
    </div>
  );
}
