const fs   = require('fs');
const path = require('path');

function generateIndexForAllTickers(baseDir) {
  if (!fs.existsSync(baseDir)) {
    console.error(`❌ Path not found: ${baseDir}`);
    process.exit(1);
  }

  fs.readdirSync(baseDir).forEach((ticker) => {
    const tickerPath = path.join(baseDir, ticker);
    if (fs.statSync(tickerPath).isDirectory()) {
      const txtFiles = fs
        .readdirSync(tickerPath)
        .filter((f) => f.endsWith('.txt'));

      const indexJson = { files: txtFiles };
      const indexPath = path.join(tickerPath, 'index.json');

      fs.writeFileSync(
        indexPath,
        JSON.stringify(indexJson, null, 2),
        'utf-8'
      );

      console.log(
        `✅ Created index.json for ${ticker} (${txtFiles.length} files)`
      );
    }
  });
}

// Adjust this to wherever your stocknews folder lives.
// If you put it under public/data/stocknews:
const stocknewsDir = path.join(__dirname, '..', 'public', 'data', 'stocknews');

generateIndexForAllTickers(stocknewsDir);