import os
import pandas as pd
import json

input_folder = 'data/stockdata'
output_folder = 'data/stockdata_json'


os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith('.csv'):
        csv_path = os.path.join(input_folder, filename)
        json_path = os.path.join(output_folder, filename.replace('.csv', '.json'))

        df = pd.read_csv(csv_path)

        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'], utc=True).astype(str)

        df.to_json(json_path, orient='records', indent=2)

print("All CSV files have been converted to JSON!")

tickers = [filename.replace('.csv', '') for filename in os.listdir(input_folder) if filename.endswith('.csv')]

with open('data/stockdata_json/stocklist.json', 'w') as f:
    json.dump(tickers, f, indent=2)


