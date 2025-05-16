import React, { useState, useEffect } from 'react'

// grab *all* .txt under /data/stocknews/**
const rawNews = import.meta.glob('/data/stocknews/**/*.txt', { as: 'raw' })

// simple accordion item
function NewsItem({ title, date, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderBottom: '1px solid #ddd',
        padding: '0.75rem 0',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <small style={{ color: '#666' }}>
          {new Date(date).toLocaleString()}
        </small>
      </div>
      {open && (
        <pre style={{
          marginTop: '0.5rem',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          color: '#333'
        }}>
          {content}
        </pre>
      )}
    </div>
  )
}

export default function StockNews({ symbol = 'AAPL' }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    async function loadNews() {
      const entries = Object.entries(rawNews)
        .filter(([path]) => path.includes(`/${symbol}/`))

      const newsList = await Promise.all(
        entries.map(async ([path, resolver]) => {
          const content = await resolver()
          const filename = path
            .split('/')
            .pop()
            .replace('.txt','')
          const parts      = filename.split('_')
          const datePart   = parts[0]        // "2025-04-15 14"
          const minutePart = parts[1]        // "44"
          const title      = parts.slice(2).join('_')
          const date       = `${datePart}:${minutePart}`

          return { title, date, content }
        })
      )

      newsList.sort((a, b) => new Date(b.date) - new Date(a.date))
      setItems(newsList)
    }

    loadNews()
  }, [symbol])

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {/* Title */}
      <h4 style={{
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        {symbol} News
      </h4>

      {/* Accordion list */}
      {items.length === 0
        ? <p>No news for {symbol}.</p>
        : items.map((it, i) => (
            <NewsItem
              key={i}
              title={it.title}
              date={it.date}
              content={it.content}
            />
          ))
      }
    </div>
  )
}