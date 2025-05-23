# Stock Market Visualization Dashboard

This project is a web application that visualizes stock market data and related news articles. It provides an interactive interface to explore stock prices, trends, and associated news.

## Features

- Interactive stock selection
- Stock price interactive visualization
- Related news articles display


## Prerequisites

Before starting, make sure you have the following installed:

1. **Miniconda** (Python environment manager)
   - Download from the official Miniconda page:
     - [Mac (Apple Silicon)](https://docs.conda.io/en/latest/miniconda.html#macos-installers)
     - [Mac (Intel)](https://docs.conda.io/en/latest/miniconda.html#macos-installers)
     - [Windows](https://docs.conda.io/en/latest/miniconda.html#windows-installers)
     - [Linux](https://docs.conda.io/en/latest/miniconda.html#linux-installers)
   - Follow the installation prompts and allow conda initialization

2. **Node.js 18+**
3. **MongoDB**

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

1. Create and activate conda environment
```zsh
conda create -n ecs273 python=3.12
conda activate ecs273
```

2. Navigate to the server directory
```zsh
cd server
```

3. Install required packages using conda
```zsh
# Install main dependencies
conda install -c conda-forge fastapi uvicorn motor pandas pymongo

# Install additional dependencies
conda install -c conda-forge python-dotenv httpx
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
   ![image](https://github.com/user-attachments/assets/1da83e4e-32ad-4200-a030-e4659cf4267e)
   
2. Interact with the stock price / t-SNE visualization
   ![image](https://github.com/user-attachments/assets/e1eb227c-c268-40d5-beb8-d37a50285644)
   
3. Click on related news articles to see detailed information

   ![image](https://github.com/user-attachments/assets/d92b6ce9-7ee0-4a1d-8cb9-33ca6ac22f8c)



### Development Notes

AI assistance was used during development to enhance code quality and readability:

- Debugging Support: AI was consulted for complex debugging issues that took more than 10 minutes to resolve manually
- Code Optimization: Used to implement efficient CSS solutions (e.g.  index.css)
- Code Readability: Assisted in formatting code and maintaining consistent naming conventions
- Documentation: Helped in creating clear and comprehensive README

The AI was used as a supplementary tool while maintaining human oversight on all critical development decisions.


## API Endpoints

- `GET /api/stocks` - Get list of all stocks
- `GET /api/stocks/{ticker}/prices` - Get historical price data for a stock
- `GET /api/stocks/{ticker}/news` - Get news articles for a stock
- `GET /api/tsne` - Get t-SNE coordinates for all stocks
