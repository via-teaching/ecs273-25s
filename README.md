# 📊 Homework 4: Full-Stack Stock Visual Analytics

This project is part of ECS 273 Homework 4. It is a full-stack web application for interactive visualization of stock market data using **MongoDB** as the backend and **React (JavaScript)** as the frontend.

![Overview](./screenshots/webview.png)
---

## 📦 Backend Setup (FastAPI + MongoDB)

- Database name: `stock_ccc`
- Data is imported into MongoDB from structured `.csv` and `.txt` files via `import_data.py`.
- The following collections are used:
  - `stockdata`: Historical stock OHLC data
  - `stocknews`: Stock-related news
  - `tsne`: 2D projection of stock embedding

### 🛠️ To run backend server

```bash
cd server
uvicorn main:app --reload
```

Make sure MongoDB is running on localhost:27017.

---

## 💻 Frontend Setup (React + D3.js)

The frontend is written in JavaScript using the `react-js-example` template and heavily customized.

### 🚀 To run frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔍 Key Features

### 📈 Line Chart
- Zoom in/out support on both **x and y axes**
- Shows tooltip with **date and OHLC values** when hovering over the chart
- Automatically clips data to prevent overflow
![Overview](./screenshots/linechart0.png)
![Overview](./screenshots/linechart1.png)

### 📰 News List
- Shows a list of clickable **news titles**
- Clicking a title opens a **modal window** with well-formatted news content
- Modal includes close button and returns to dashboard view
![Overview](./screenshots/news0.png)
![Overview](./screenshots/news1.png)

---

## 📁 Folder Structure

```
Homework4/
├── client/              # React frontend
│   ├── src
│   │    ├──components/
│   │    │      ├──LineChart
│   │    │      ├──NewsList
│   │    │      └── ...
│   │    └──App.jsx
│   └── ...
├── screenshots/ 
├── server/              # FastAPI backend
│   ├── main.py
│   ├── import_data.py
│   └── data_scheme.py
└── data/                # CSV and text source data
```

---

## 🧠 Notes

- MongoDB must be preloaded using `import_data.py`
- Make sure to run backend and frontend simultaneously (e.g., in split terminal tabs)
- Stock data and news must match tickers (e.g., `GOOGL`, `AAPL`, etc.)


---

## 🛠️ Setup Instructions

To run this project successfully, please follow the steps below to start both the backend (FastAPI + MongoDB) and the frontend (React + D3.js).

### 🔧 Backend Instructions

**1. Navigate to the backend folder**

```bash
cd server
```

**2. Install Python dependencies**

```bash
pip install -r requirements.txt
```

**4. Make sure MongoDB is running locally**

If you're on macOS with Homebrew:

```bash
brew services start mongodb-community
```

**5. Import stock, news, and t-SNE data into MongoDB**

```bash
python import_data.py
```

**6. Launch the FastAPI backend server**

```bash
uvicorn main:app --reload --port 8000
```

Access Swagger UI at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🌐 Frontend Instructions

**1. Navigate to the frontend folder**

```bash
cd client
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the frontend development server**

```bash
npm run dev
```

Then visit: [http://localhost:5173](http://localhost:5173)

---

Once both servers are running:

- The frontend can fetch data live from the backend API
- You will be able to see interactive stock charts and formatted news popups
