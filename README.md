# ECS273 Homework3
To launch the visualizer web app locally:

```bash
cd Homework3
cd srisingh

# Install dependencies
npm install
npm install papaparse
npm install recharts

# Generate files.json for stocknews
node generateFileLists.js

# Start the development server
npm run dev

# Homework 4: Stock Visualizer Full-Stack App

This project is split into two parts:

client – React frontend visualizing stock data, news, and t-SNE projection

server – FastAPI backend serving stock and news data from MongoDB

## Server

For the server part, make sure you have the respective packages installed.

```
pip install -r requirements.txt
```

Secondly, make sure you have already installed and started your mongoDB local server.
For example, for mongodb managed with homebrew, run:

```
brew services start mongodb-community
```

Then, put your data into database with:

```
python import_data.py
```

Finally, start your api server by,

```
uvicorn main:app --reload --port 8000
```

## Client

Install dependencies and start dev server:


```
cd client
npm install
npm run dev
```
This will launch the frontend on:
http://localhost:5173