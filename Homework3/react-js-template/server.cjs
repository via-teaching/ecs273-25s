const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const ROOT = path.join(__dirname, 'data', 'stocknews');

app.use(cors());
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/api/news/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const stockDir = path.join(ROOT, ticker);
  if (!fs.existsSync(stockDir)) return res.json([]);

  const files = fs.readdirSync(stockDir)
    .filter(f => f.endsWith('.txt'))
    .map(filename => ({
      filename,
      url: `/data/stocknews/${ticker}/${filename}`
    }));

  res.json(files);
});

app.listen(3001, () => {
  console.log('API server running at http://localhost:3001');
});
