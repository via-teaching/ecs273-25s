# Visual Analytics Project

This project is a visual analytics application that includes a backend powered by FastAPI and a frontend built with React. The application provides interactive visualizations such as scatter plots and line charts, fetching data dynamically from APIs.

## Features

- **Scatter Plot**: Visualizes t-SNE data with zooming, panning, and highlighting functionality for a selected ticker.
- **Line Chart**: Displays stock price trends with zooming and scrolling capabilities.
- **Stock News**: Fetches and displays news articles related to a selected stock ticker.

---

## Setup Instructions

Follow these steps to set up and run the project locally.

### Prerequisites

- **Node.js** (v16 or later)
- **Python** (v3.9 or later)
- **MongoDB** (running locally or remotely)

---

### Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd server

2. **Activate Virtual Environment**:
    ```bash
    conda activate ecs273

3. **Install required Python packages**:
    ```bash
    pip install -r requirements.txt

4. **Ensure MongoDB is running**: (If using Homebrew on macOS)
    ```bash
    brew services start mongodb-community

5. **Import data into the database:**
    ```bash
    python import_data.py

6. **Run the FastAPI server:**
    ```bash
    uvicorn main:app --reload --port 8000
-  API Docs available at: http://localhost:8000/docs

------------------

### Frontend Setup

1. **Navigate to the frontend folder**:
    ```bash
    cd client

2. **Install required Node.js packages**:
    ```bash
    npm install

3. **Start the React development server**:
    ```bash
    npm run dev

4. **Visit the frontend in your browser**:

- Usually available at: http://localhost:5173
--------------------

## Folder Structure

```
ecs273-25s/
├── Homework4/
│   ├── server/                             # Backend code (FastAPI)
│   │   ├── data/                           # Data folder for backend
│   │   │   ├── stockdata/                  # Stock price data for line chart
│   │   │   │   ├── AAPL.csv
│   │   │   │   └── ...  
│   │   │   ├── stocknews/                  # News data for stock news
│   │   │   │   ├── AAPL/
│   │   │   │   │   ├── 2025-04-15_...txt
│   │   │   │   │   └── ...
│   │   │   │   └── ...         
│   │   │   └── tsne.csv                    # t-SNE data for scatter plot
│   │   ├── main.py                         # Main FastAPI application
│   │   ├── requirements.txt                # Python dependencies
│   │   ├── import_data.py                  # Script to import data into MongoDB
│   │   └── data_scheme.py                  # Data Models
│   ├── client/                             # Frontend code (React)
│   │   ├── src/                            # React source code
│   │   │   ├── components/                 # React components (ScatterPlot, LineChart, etc.)
│   │   │   └── ...                         # Other frontend files
│   │   ├── package.json                    # Node.js dependencies
│   │   └── ...                             # Other frontend files
│   └── README.md                           # Project documentation
└── ...
```

---

## Additional Notes

- **API Endpoints**:
  - `/tsne`: Fetches t-SNE data for scatter plot visualization.
  - `/stock/<stock_name>`: Fetches stock price data for the line chart.
  - `/stocknews/<stock_name>`: Fetches news articles for a specific stock.

- **Known Issues**:
  - Ensure MongoDB is running before starting the backend.
  - The frontend assumes the backend is running on `http://localhost:8000`.

- **Assumptions**:
  - The user has basic knowledge of web development and terminal commands.

---

## Declaration of AI Assistance

This project has been partially developed with the assistance of AI tools, including GitHub Copilot, to improve productivity and streamline development. All AI-generated code has been reviewed and integrated by me.

---


## License

This project is for educational purposes and is not licensed for commercial use.