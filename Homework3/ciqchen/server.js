import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔧 解決 __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5174;

app.use(cors());

app.get('/api/list-news', (req, res) => {
  const { ticker } = req.query;
  const dir = path.join(__dirname, 'data', 'stocknews', ticker);

  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading files:', err);
      return res.status(200).json([]);
    }
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    res.json(txtFiles);
  });
});

app.get('/api/news-content', (req, res) => {
  const { ticker, filename } = req.query;
  const filePath = path.join(__dirname, 'data', 'stocknews', ticker, filename);
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(404).send('File not found');
    }
    res.send(content);
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Express server is running at http://localhost:${PORT}`);
});
