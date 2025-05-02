import { useState, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';

interface NewsArticle {
    title: string;
    date: string;
    url?: string;
    content: string;
    id: string;
}

interface NewsListInterface {
    selectedStock: string;
}

interface ArticlesIndex {
    [ticker: string]: string[];
}

export default function NewsList({ selectedStock }: NewsListInterface) {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadNewsForStock = async (stockSymbol: string) => {
            try {
                // Loading article names from JSON file
                const indexResponse = await fetch('/data/articles.json');
                if (!indexResponse.ok) {
                    console.error("Failed to load articles index");
                    setNewsItems([]);
                    return;
                }

                // Get the list of article filenames for the selected stock symbol
                const articlesIndex: ArticlesIndex = await indexResponse.json();
                const fileNames = articlesIndex[stockSymbol] || [];
                if (isEmpty(fileNames)) {
                    console.log(`No news found for ${stockSymbol}`);
                    setNewsItems([]);
                    return;
                }

                // Load an display the news articles
                const newsPromises = fileNames.map(async (fileName) => {
                    try {
                        // Encode the filename bypass errors
                        const encodedFileName = encodeURIComponent(fileName);
                        const fileResponse = await fetch(`/data/stocknews/${stockSymbol}/${encodedFileName}`);

                        if (!fileResponse.ok) return null;
                        const text = await fileResponse.text();
                        // Skip HTML responses
                        // if (text.toLowerCase().includes('<!doctype html>')) {
                        //     console.warn(`Skipping HTML response for ${fileName}`);
                        //     return null;
                        // }

                        const lines = text.split('\n');

                        return {
                            title: lines[0] || "Missing Article Title",
                            date: lines[1].replace(/-/g, ':') || "Missing date",
                            url: lines[2] || undefined,
                            content: lines.slice(3).join('\n'),
                            id: `${stockSymbol}-${fileName.replace(/\.[^/.]+$/, "")}`
                        };
                    }
                    catch (error) {
                        console.error(`Error loading news file ${fileName}:`, error);
                        return null;
                    }
                });

                const articles = await Promise.all(newsPromises);
                const validArticles = articles.filter(article => article !== null) as NewsArticle[];
                setNewsItems(validArticles);
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
                            <li key={item.id} className="border border-gray-300">
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="cursor-pointer hover:bg-gray-50 p-4 transition-colors"
                                >
                                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{item.date}</p>

                                    {expandedItemId === item.id && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="text-gray-700 text-sm whitespace-pre-line max-h-72 overflow-auto">
                                                {item.content}
                                            </div>

                                            {item.url && (
                                                <a
                                                    href={item.url}
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