import os
import json

def generate_index_for_all_tickers(base_path):
    if not os.path.exists(base_path):
        print(f"Path not found: {base_path}")
        return

    for ticker in os.listdir(base_path):
        ticker_path = os.path.join(base_path, ticker)
        if os.path.isdir(ticker_path):
            txt_files = [f for f in os.listdir(ticker_path) if f.endswith('.txt')]
            index_path = os.path.join(ticker_path, 'index.json')
            with open(index_path, 'w') as f:
                json.dump(txt_files, f, indent=2)
            print(f"✅ Created index.json for {ticker} ({len(txt_files)} files)")

generate_index_for_all_tickers("data/stocknews")
