# Homework 4 

This folder contains two parts, client and server.

## 📁 Folder Structure

```plaintext
Homework4/
├── client/                     # Frontend (React + TypeScript)
│   ├── public/                 
│   ├── src/                    # Main source code
│   │   ├── component/          # React components
│   │   │   ├── NewsList.tsx         # News list view (View 3)
│   │   │   ├── options.tsx          # Dropdown select for stock
│   │   │   ├── StockLineChart.tsx   # Stock price line chart (View 1)
│   │   │   └── TSNEScatter.tsx      # t-SNE scatter plot (View 2)
│   │   └── App.tsx             # Main app layout and logic
│   └── package.json            # Project config and dependencies

├── server/                     # Backend (FastAPI + MongoDB)
│   ├── data/                   # Raw input files
│   │   ├── stockdata/          # CSV files for stock prices
│   │   ├── stocknews/          # News articles (txt format)
│   │   └── tsne.csv            # CSV file for t-SNE projection
│   ├── data_scheme.py          # schemas
│   ├── import_data.py          # put data into MongoDB
│   └── main.py                 # FastAPI server with defined endpoints
│
├── requirements.txt            # Backend Python package requirements
```


## Server (A backend instruction):
1. Navigate to the backend folder
```
cd server
```
2. Set up a Python virtual environment by Miniconda
```
conda create -n myenv python=3.11
conda activate myenv
```
3. For the server part, make sure you have the respective packages installed.
```
pip install -r requirements.txt
```
4. Make sure MongoDB is running (command by using Homebrew on macOS):
```
brew services start mongodb/brew/mongodb-community@7.0
```

5. Put your data into database
```
python import_data.py
```

6. Run the FastAPI server
```
uvicorn main:app --reload --port 8000
```
API Docs available at: http://localhost:8000/docs

## Client (A frontend instruction) :
1. Navigate to the frontend folder
```
cd client
```
2. Install required Node.js packages
```
npm install
```
3. Start the React development server
```
npm run dev
```
4. Visit the frontend in your browser : http://localhost:5173

## Close MongoDB
```
brew services stop mongodb/brew/mongodb-community@7.0
```
