# Homework 4: Stock News Visualization with Database Connection

## Introduction

This project visualizes stock data and news with a complete stack implementation including:
- MongoDB database for data storage
- FastAPI backend server for API endpoints
- React frontend with TypeScript and Vite for visualization

AI was used to help me learn some of the syntax and code for mongoDB/fastAPI

## Project Structure - Homework 4

The folder contains two main parts:
- `client`: Frontend application built with React, TypeScript, and Vite
- `server`: Backend API built with FastAPI and connected to MongoDB

## Setup Instructions
First ensure you have the MongoDB community edition installed. 
Then ensure you have Python correctly installed (v. 3.12.2 tested and recommended), and set up a Python virtual environment (optional). 

### Server Setup

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

### Client Setup

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

## Additional Notes

- This project was successfully tested and runs on Windows and VS Code
- The client side code builds off Homework 3, but now connects to the API to fetch data from the MongoDB database
- Make sure both the MongoDB service and the FastAPI server are running before starting the client application
- The `import_data.py` script needs to be run only once to populate the database with stock news data

## Branch Information

The main branch contains the complete implementation for Homework 4 and 3. Navigate to their respective folders and follow the readMe for executing the code. 


