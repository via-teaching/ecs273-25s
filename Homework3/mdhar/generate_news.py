import os
import json
from datetime import datetime

# Define the base directory containing the stock news folders
base_dir = 'C:/Users/mdhar/OneDrive/Documents/ECS 273/hw3/ecs273-25s/Homework3/mdhar/react-js-template/data/stocknews'

# Define the output path for the JSON file
output_path = os.path.join(os.path.dirname(__file__), 'data', 'news.json')

# Create the 'data' directory if it doesn't exist
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Initialize an empty dictionary to store the data
stock_news = {}

# Loop through each stock folder (e.g., AAPL, BAC, CAT)
for company_folder in os.listdir(base_dir):
    company_folder_path = os.path.join(base_dir, company_folder)
    
    if os.path.isdir(company_folder_path):
        # Initialize a list for the current company
        stock_news[company_folder] = []
        
        # Loop through each text file in the company's folder
        for file_name in os.listdir(company_folder_path):
            file_path = os.path.join(company_folder_path, file_name)
            
            if file_name.endswith('.txt') and os.path.isfile(file_path):
                # Read the file's content
                with open(file_path, 'r', encoding='utf-8') as file:
                    # Extract title and date from the file name (assuming the file name format is correct)
                    file_parts = file_name.split('_', 1)
                    
                    if len(file_parts) > 1:
                        date_str = file_parts[0]
                        title = file_parts[1].replace('.txt', '').replace('_', ' ')
                        
                        try:
                            # Parse the date from the filename (assuming the format is YYYY-MM-DD HH-MM)
                            date_obj = datetime.strptime(date_str, '%Y-%m-%d %H-%M')
                            formatted_date = date_obj.strftime('%Y-%m-%d')
                        except ValueError:
                            formatted_date = date_str  # If there's an issue with date format, keep it as is

                        # Read the content of the article
                        content = file.read().strip()

                        # Add the news article to the company's list
                        stock_news[company_folder].append({
                            'title': title,
                            'date': formatted_date,
                            'content': content
                        })

# Save the stock news data to a JSON file
with open(output_path, 'w', encoding='utf-8') as json_file:
    json.dump(stock_news, json_file, ensure_ascii=False, indent=4)

print(f"news.json file has been generated successfully at {output_path}.")
