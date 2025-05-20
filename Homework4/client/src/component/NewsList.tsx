import { useState, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';

// Defines the structure of a news article received from the API
interface NewsArticle {
    _id: string;
    Stock: string;
    Title: string;
    Date: string;
    URL?: string;
    content: string;
}

interface NewsListInterface {
    selectedStock: string;
}


export default function NewsList({ selectedStock }: NewsListInterface) {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Function to format date strings better
    const formatDate = (dateStr: string): string => {
        try {
            const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2})-(\d{2}))?$/);
            if (dateMatch) {
                const [_, year, month, day, hour, minute] = dateMatch;
                const formattedDate = `${month}/${day}/${year}`;
                if (hour && minute) {
                    return `${formattedDate} ${hour}:${minute}`;
                }
                return formattedDate;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    // Fetch news articles whenever the selected stock changes
    useEffect(() => {
        const loadNewsForStock = async (stockSymbol: string) => {
            try {
                // Fetch news data from API for the selected stock
                const response = await fetch(`http://localhost:8000/stocknews/?stock_name=${stockSymbol}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newsData = await response.json();
                // Ensure each article has a unique ID for React keys
                const articlesWithIds = (newsData.articles || []).map((article: NewsArticle, index: number) => ({
                    ...article,
                    _id: article._id || `${stockSymbol}-${index}`
                }));

                setNewsItems(articlesWithIds);
                setExpandedItemId(null);
            }
            catch (error) {
                console.error(`Error loading news for ${stockSymbol}:`, error);
                setNewsItems([]);
            }
        };

        if (selectedStock) {
            loadNewsForStock(selectedStock);
        } else {
            setNewsItems([]);
        }
    }, [selectedStock]);

    // Article expansion handling
    const toggleExpand = (id: string) => {
        if (expandedItemId === id) {
            setExpandedItemId(null);
        } else {
            setExpandedItemId(id);
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col w-full h-full overflow-hidden"
        >
            {isEmpty(newsItems) ? (
                <div className="flex-grow flex justify-center items-center">
                    <p className="text-gray-500">No news found for stock: {selectedStock}</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-scroll scrollbar-thin pr-2">
                    <ul className="pb-4">
                        {newsItems.map(item => (
                            <li key={item._id} className="border border-gray-300">
                                <div
                                    onClick={() => toggleExpand(item._id)}
                                    className="cursor-pointer hover:bg-gray-50 p-4 transition-colors"
                                >
                                    <h4 className="font-medium text-gray-800">{item.Title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{formatDate(item.Date)}</p>

                                    {expandedItemId === item._id && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="text-gray-700 text-sm whitespace-pre-line max-h-72 overflow-auto">
                                                {item.content}
                                            </div>

                                            {item.URL && (
                                                <a
                                                    href={item.URL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline mt-3 inline-block text-sm"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    Link to full article
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}