import os
import json

def create_index(ticker_path):
    txt_files = [f for f in os.listdir(ticker_path) if f.endswith('.txt')]
    index_path = os.path.join(ticker_path, 'index.json')
    
    with open(index_path, 'w') as f:
        json.dump(txt_files, f, indent=2)
        
    return len(txt_files)

def generate_index_for_all_tickers(stock_news_path):
    tickers = filter(lambda ticker: os.path.isdir(os.path.join(stock_news_path, ticker)), os.listdir(stock_news_path))
    
    for ticker in tickers:
        ticker_path = os.path.join(stock_news_path, ticker)
        file_count = create_index(ticker_path)
        print(f"Created index.json for {ticker} ({file_count} files)")

generate_index_for_all_tickers("data/stocknews")
