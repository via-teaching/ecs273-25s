import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, 'data', 'stocknews');
const index = {};

fs.readdirSync(rootDir).forEach((ticker) => {
  const tickerPath = path.join(rootDir, ticker);
  if (fs.statSync(tickerPath).isDirectory()) {
    const files = fs.readdirSync(tickerPath).filter((f) => f.endsWith('.txt'));
    index[ticker] = files;
  }
});

fs.writeFileSync(
  path.join(rootDir, 'index.json'),
  JSON.stringify(index, null, 2)
);

console.log('index.json generated!');
