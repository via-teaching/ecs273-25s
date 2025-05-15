import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Corrected path
const baseDir = path.join(__dirname, 'public', 'data', 'stocknews');

fs.readdirSync(baseDir).forEach(ticker => {
  const dirPath = path.join(baseDir, ticker);
  if (!fs.statSync(dirPath).isDirectory()) return; // ✅ skip .DS_Store etc.

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.txt'));
  fs.writeFileSync(path.join(dirPath, 'files.json'), JSON.stringify(files, null, 2));
  console.log(`✅ Wrote ${files.length} entries to ${ticker}/files.json`);
});
