import { useEffect, useState } from "react";

export default function NewsList({ selectedTicker }) {
  const [news, setNews] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/parsed_news.json")
      .then(res => res.json())
      .then(setNews);
  }, []);

  const filtered = news.filter(n => n.ticker === selectedTicker);

  return (
    <div className="h-full w-full px-4 py-2 rounded bg-white/90 flex flex-col overflow-hidden">
      <h2 className="text-lg font-semibold mb-3">Recent news for {selectedTicker}</h2>
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {filtered.map((item, idx) => {
          const isOpen = expanded === idx;

          return (
            <div
              key={idx}
              className={`bg-blue-100 border rounded-lg shadow-sm transition-all duration-300`}
              style={{
                maxHeight: isOpen ? '320px' : '84px',
                overflowY: isOpen ? 'auto' : 'hidden'
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                className="w-full text-left"
              >
                <div className="bg-blue-300 text-blue-900 font-semibold px-4 py-2 rounded-t">
                  <div className="truncate">{item.title.replace(/_/g, " ")}</div>
                  <div className="text-xs mt-1">{item.date}</div>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-2 text-sm text-gray-800 whitespace-normal break-words">
                  <div className="mb-2 font-semibold text-gray-700">
                    Title: {item.title.replace(/_/g, " ")}
                  </div>
                  {item.content.split('\n').map((line, i) => {
                    if (line.startsWith("URL:")) {
                      const url = line.replace("URL: ", "").trim();
                      return (
                        <div key={i} className="mb-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline break-all"
                          >
                            Go to the News Article →
                          </a>
                        </div>
                      );
                    } else {
                      return <span key={i}>{line + " "}</span>;
                    }
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
