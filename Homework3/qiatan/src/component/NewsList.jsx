// src/components/NewsList.jsx
import React, { useEffect, useState } from 'react'

const NewsList = ({ selectedStock }) => {
  const [newsList, setNewsList] = useState([])
  const [expandedIdx, setExpandedIdx] = useState(null)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/stocknews_by_stock.json`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(allData => {
        const arr = allData[selectedStock] || []
        const list = arr.map(item => ({
          ...item,
          date:
            item.date ||
            (() => {
              const m = item.title.match(/^(\d{4})(\d{2})(\d{2})/)
              return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
            })(),
        }))

        setNewsList(list)
      })
      .catch(err => {
        console.error('loading failed', err)
        setNewsList([])
      })
  }, [selectedStock])

  return (
    <div className="overflow-y-auto h-full p-2">
      {newsList.length === 0 ? (
        <p className="text-center text-gray-500">
          No news found for {selectedStock}
        </p>
      ) : (
        newsList.map((news, idx) => (
          <div
            key={idx}
            className="border-b py-2 cursor-pointer"
            onClick={() =>
              setExpandedIdx(expandedIdx === idx ? null : idx)
            }
          >
            <div className="font-medium">{news.title}</div>
            {news.date && (
              <div className="text-gray-500 text-sm">{news.date}</div>
            )}
            {expandedIdx === idx && (
              <pre className="mt-2 text-gray-700 whitespace-pre-wrap">
                {news.content}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default NewsList
