# Stock Market Visualization Dashboard

This project is a web application that visualizes stock market data and related news articles. It provides an interactive interface to explore stock prices, trends, and associated news.

## Features

- Interactive stock selection
- Real-time price visualization
- Related news articles display
- Responsive layout with multiple views

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB

## Project Structure

```
Homework4/
├── client/           # Frontend React application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json  # Dependencies
└── server/           # Backend FastAPI server
    ├── data/         # Stock and news data
    ├── main.py       # Server entry point
    └── import_data.py # Data import script
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory
```zsh
cd server
```

2. Set up a Python virtual environment
```zsh
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install required Python packages
```zsh
pip install -r requirements.txt
```

4. Make sure MongoDB is running
```zsh
# If using Homebrew on macOS:
brew services start mongodb-community
```

5. Import data into the database
```zsh
python import_data.py
```

6. Start the FastAPI server
```zsh
uvicorn main:app --reload --port 8000
```

The API documentation will be available at: http://localhost:8000/docs

### Frontend Setup

1. Navigate to the client directory
```zsh
cd client
```

2. Install Node.js dependencies
```zsh
npm install
```

3. Start the development server
```zsh
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

## Usage

1. Select a stock from the dropdown menu in the header
2. View the stock price visualization in the main chart
3. Click on news articles to see detailed information
4. Use the interactive features to explore different time periods and data points

## Additional Notes

- The application uses MongoDB for data storage
- Real-time updates are handled through FastAPI's async capabilities
- The frontend is built with React and uses modern CSS features

### Development Notes

AI assistance was used during development to enhance code quality and readability:

- Debugging Support: AI was consulted for complex debugging issues that took more than 10 minutes to resolve manually
- Code Optimization: Used to implement efficient CSS solutions (e.g.  index.css)
- Code Readability: Assisted in formatting code and maintaining consistent naming conventions
- Documentation: Helped in creating clear and comprehensive README

The AI was used as a supplementary tool while maintaining human oversight on all critical development decisions.

1. Stock Price Chart
   - Shows historical price data for the selected stock
   - Includes Open, High, Low, and Close prices
   - Supports zooming and panning

2. t-SNE Scatter Plot
   - Visualizes stock relationships using t-SNE dimensionality reduction
   - Color-coded by sector
   - Supports zooming and panning

3. News Feed
   - Displays latest news articles for the selected stock
   - Shows article title, date, and content
   - Includes links to full articles when available

## API Endpoints

- `GET /api/stocks` - Get list of all stocks
- `GET /api/stocks/{ticker}/prices` - Get historical price data for a stock
- `GET /api/stocks/{ticker}/news` - Get news articles for a stock
- `GET /api/tsne` - Get t-SNE coordinates for all stocks
