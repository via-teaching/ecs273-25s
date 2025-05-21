import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Needed to replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5173;

app.use(cors());

app.get("/api/news/:ticker", (req, res) => {
  const { ticker } = req.params;
  const folderPath = path.join(__dirname, "data", "stocknews", ticker);

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(404).json({ error: "Stock not found." });
    }

    const txtFiles = files.filter(f => f.endsWith(".txt"));

    const newsItems = txtFiles.map(fileName => {
      const [datePart, ...titleParts] = fileName.replace(".txt", "").split("_");
      const title = titleParts.join(" ").replace(/-/g, " ");
      const filePath = path.join(folderPath, fileName);
      const content = fs.readFileSync(filePath, "utf-8");

      return {
        title: title.trim(),
        date: datePart.trim(),
        content: content.trim()
      };
    });

    res.json(newsItems);
  });
});

app.listen(PORT, () => {
  console.log(`Stock news server running at http://localhost:${PORT}`);
});
