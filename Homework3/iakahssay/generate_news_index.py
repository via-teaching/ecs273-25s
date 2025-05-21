import os
import json

def generate_stocknews_index(stocknews_dir):
    index = {}
    
    for stock in os.listdir(stocknews_dir):
        stock_path = os.path.join(stocknews_dir, stock)
        if os.path.isdir(stock_path):
            txt_files = [
                f for f in os.listdir(stock_path)
                if f.endswith(".txt") and os.path.isfile(os.path.join(stock_path, f))
            ]
            index[stock] = sorted(txt_files)

    return index

if __name__ == "__main__":
    stocknews_dir = "data/stocknews"  # adjust path if running from another location
    index = generate_stocknews_index(stocknews_dir)

    # Print the dictionary to console
    print(json.dumps(index, indent=2))
