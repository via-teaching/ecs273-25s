import os
import json

stocks = ["xom", "cvx", "hal", "mmm", "cat", "dal", "mcd", "nke", "ko", "jnj", "pfe", "unh", "jpm", "gs", "bac", "aapl", "msft", "nvda", "googl", "meta"]
filenamedata = []
base_path = os.path.join('data', 'stocknews')

for stock in stocks:
    folder_path = os.path.join(base_path, stock)

    if not os.path.exists(folder_path):
        print(f"not exist: {folder_path}")
        continue

    file_names = [f for f in os.listdir(folder_path)
                  if os.path.isfile(os.path.join(folder_path, f))]

    filenamedata.append({"stock": stock, "filenames": file_names})
    print(f"{stock}: found {len(file_names)} files")

output_path = os.path.join(base_path, 'all_file_names.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"filenamedata": filenamedata}, f, indent=2)

print(f"\nSaved all file names in: {output_path}")
