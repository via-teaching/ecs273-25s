import { useEffect, useState } from "react";

export function NewsList({ selectedTicker }) {
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    if (!selectedTicker) return;
    fetch(`http://localhost:5174/api/list-news?ticker=${selectedTicker}`)
    .then(res => res.json())
    .then(setFileNames);
  }, [selectedTicker]);

  return (
    <div className="p-4 overflow-y-auto h-full text-sm text-blue-600">
      {fileNames.length === 0 && <p className="text-gray-500">No news available.</p>}
      <ul className="space-y-2">
        {fileNames.map((file, index) => (
          <li key={index}>
                <a
                href={`http://localhost:5174/api/news-content?ticker=${selectedTicker}&filename=${file}`}
                target="_blank"
                rel="noopener noreferrer"
                >
              {file}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
