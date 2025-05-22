import React, { useState } from 'react';

export interface NewsEntry {
  title: string;
  date: string;
  content: string;
}

interface NewsItemProps {
  entry: NewsEntry;
}

const NewsItem: React.FC<NewsItemProps> = ({ entry }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderBottom: '1px solid #ddd',
        padding: '0.75rem 0',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{entry.title}</strong>
        <small style={{ color: '#666' }}>
          {new Date(entry.date).toLocaleString()}
        </small>
      </div>
      {open && (
        <pre
          style={{
            marginTop: '0.5rem',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            color: '#333',
          }}
        >
          {entry.content}
        </pre>
      )}
    </div>
  );
};

interface StockNewsProps {
  symbol: string;
  items: NewsEntry[];
}

const StockNews: React.FC<StockNewsProps> = ({ symbol, items }) => {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h4
        style={{
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}
      >
        {symbol} News
      </h4>
      {items.length === 0 ? (
        <p>No news for {symbol}.</p>
      ) : (
        items.map((entry, idx) => (
          <NewsItem key={idx} entry={entry} />
        ))
      )}
    </div>
  );
};

export default StockNews;

