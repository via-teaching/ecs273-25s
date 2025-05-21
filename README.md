# Homework 3 and 4 ReadMe

## Homework 3 Stock Data/News Visualization
### Introduction
This project visualizes stock data and news for 20 different stocks using data gathered in May 2025. 
AI and various online resources were used to help me learn D3 syntax for interactive chart rendering. 
Used existing templates as reference, but significant modification was still made to the templates. 

Primary templates used:
Source: options.tsx
Line-chart Source: https://observablehq.com/@d3/line-chart/2
Scatterplot Source: https://observablehq.com/@d3/zoomable-area-chart
Legend Source: https://d3-graph-gallery.com/graph/custom_legend.html

### Setup Instructions

The folder with my code is self-contained with all dependencies and environment requirements included. 
Navigate into my pprabhu folder and install dependencies and run the code with the below commands:

**1. Navigate to the main folder**
```
cd Homework3/pprabhu
```

**2. Install required Node.js packages**
```
npm install
```

**3. Start the React development server**
```
npm run dev
```

**4. Access the application in your browser**
The application will be available at: http://localhost:5173 (or the port shown in your terminal)

### Instruction for the views
#### Stock overview line chart: 
For zooming, first place the cursor within the boundaries of the line chart (needs to be on a line) and hover the cursor directly over the line/s you wish to zoom into, scrolling the mousewheel up will zoom in, scrolling mousewheel down will zoom out. 

For panning (Horizontal scrolling), you first must zoom in so that a portion of the time series is not visible. Next, place the cursor directly over any line, click and hold the left mouse button, and drag to the left or right to pan. 

#### t-SNE Scatterplot: 
For zooming, first place the cursor within the boundaries of the Scatterplot and hover the cursor directly over the area you wish to zoom into, scrolling the mousewheel up will zoom in, scrolling mousewheel down will zoom out. 

For panning, place the cursor directly over any area within the Scatterplot, click and hold the left mouse button, and drag in any direction to pan. 

#### News List: 
Hover the cursor over the article you wish to read. Click the article to expand the box displaying the content of the article, clicking the expanded box again will minimize the article back to its original preview. 

### Additional Notes
To avoid issues with fetching news articles, the naming of the articles in the stocknews folder is similar to that in HW1, but was modified to have a much stricter naming convention to only allow alphanumeric characters and underscores. The txt news articles must follow this naming contraints to avoid issues with displaying the articles caused by encodeURI with certain non-alphanumeric characters. 

An additional articles.json file was added to the data folder. This json contains the file names for all the news articles which is needed as the exact path of the files are required for await fetch to get each .txt article. 

tsne.csv contains the two columns, each representing one of the two-dimensional coordinates for each stock for the past two years. It also contains the stockname and sector the stock belongs to, which is needed to properly implement the scatterplot.  

## Homework 4: Stock Data/News Visualization with Database Connection

### Introduction

This project visualizes stock data and news with a complete stack implementation including:
- MongoDB database for data storage
- FastAPI backend server for API endpoints
- React frontend with TypeScript and Vite for visualization

AI was used to help me learn some of the syntax and code for mongoDB/fastAPI

### Project Structure - Homework 4

The folder contains two main parts:
- `client`: Frontend application built with React, TypeScript, and Vite
- `server`: Backend API built with FastAPI and connected to MongoDB

### Setup Instructions
First ensure you have the MongoDB community edition installed. 
Then ensure you have Python correctly installed (v. 3.12.2 tested and recommended), and set up a Python virtual environment (optional). 

#### Server Setup

**1. Navigate to the server folder**
```
cd Homework4/server
```

**2. Install required Python packages**
```
pip install -r requirements.txt
```

**3. Make sure MongoDB is running**
For MongoDB managed with homebrew on macOS:
```
brew services start mongodb-community
```
On Windows, open a new command prompt terminal as administrator and execute:
```
net start MongoDB
```

**4. Import data into the database**
```
python import_data.py
```

**5. Start the FastAPI server**
```
uvicorn main:app --reload --port 8000
```

API documentation is accessible at: http://localhost:8000/docs

#### Client Setup

**1. Navigate to the client folder**
```
cd Homework4/client
```

**2. Install required Node.js packages**
```
npm install
```

**3. Start the React development server**
```
npm run dev
```

**4. Access the application in your browser**
The application will be available at: http://localhost:5173 (or the port shown in your terminal)

### Additional Notes

- This project was successfully tested and runs on Windows and VS Code
- The client side code builds off Homework 3, but now connects to the API to fetch data from the MongoDB database
- Make sure both the MongoDB service and the FastAPI server are running before starting the client application
- The `import_data.py` script needs to be run only once to populate the database with stock news data

## Branch Information

The main branch contains the complete implementation for Homework 4 and 3. Navigate to their respective folders and follow the readMe for executing the code. 


