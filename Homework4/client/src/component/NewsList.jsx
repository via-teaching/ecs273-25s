import React, { useEffect, useState } from 'react'

const NewsList = ({ selectedStock }) => {
  const [newsList, setNewsList] = useState([])
  const [expandedIdx, setExpandedIdx] = useState(null)

  useEffect(() => {
    const url = `http://localhost:8000/news/?stock_name=${selectedStock}`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(allData => {
        const list = allData.map(item => ({
          ...item,
          date: item.Date,
          title: item.Title,
          content: item.content
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
