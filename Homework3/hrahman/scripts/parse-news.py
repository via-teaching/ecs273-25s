import os
import json
from datetime import datetime

news_root = "./data/stocknews"
output_path = "./public/parsed_news.json"

def extract_from_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.read().strip().splitlines()

        title_line = next((line for line in lines if line.lower().startswith("title:")), None)
        date_line = next((line for line in lines if line.lower().startswith("date:")), None)

        title = title_line.split(":", 1)[1].strip() if title_line else "Untitled"
        date_str = date_line.split(":", 1)[1].strip() if date_line else None
        date_obj = datetime.strptime(date_str, "%Y-%m-%d %H:%M") if date_str else None

        content_lines = [line for line in lines if not line.lower().startswith(("title:", "date:"))]
        content = "\n".join(content_lines).strip()

        return date_obj, title, content
    except Exception as e:
        print(f"⚠️ Failed to parse {filepath}: {e}")
        return None, None, None

all_news = []

if not os.path.exists(news_root):
    print(f"❌ Folder not found: {news_root}")
    exit(1)

for ticker in os.listdir(news_root):
    ticker_path = os.path.join(news_root, ticker)
    if os.path.isdir(ticker_path):
        for fname in os.listdir(ticker_path):
            if fname.endswith(".txt"):
                fpath = os.path.join(ticker_path, fname)
                date_obj, title, content = extract_from_file(fpath)
                if date_obj and title:
                    all_news.append({
                        "ticker": ticker,
                        "title": title,
                        "date": date_obj.strftime("%Y-%m-%d %H:%M"),
                        "timestamp": date_obj.timestamp(),
                        "content": content
                    })

# Sort by newest
all_news.sort(key=lambda x: x["timestamp"], reverse=True)

# Write to JSON
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", encoding="utf-8") as out:
    json.dump(all_news, out, indent=2)

print(f"✅ News written to {output_path} with {len(all_news)} entries.")
