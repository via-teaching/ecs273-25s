import os
import json
import urllib.parse

# Define the base directory for stock news
base_dir = "../data/stocknews"
output_file = os.path.join(base_dir, "news_files.json")

def generate_news_files_json():
    result = {}

    # Iterate through each folder (ticker) in the base directory
    for ticker in os.listdir(base_dir):
        ticker_path = os.path.join(base_dir, ticker)

        # Check if it's a directory
        if os.path.isdir(ticker_path):
            # Get all .txt files in the directory
            txt_files = [
                urllib.parse.quote(f)  # Encode the file name for URI
                for f in os.listdir(ticker_path)
                if f.endswith(".txt")
            ]
            result[ticker] = txt_files

    # Write the result to news_files.json
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"news_files.json has been generated at {output_file}")

# Run the script
if __name__ == "__main__":
    generate_news_files_json()