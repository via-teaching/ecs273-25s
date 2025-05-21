# Homework 4

This folder contains two parts, client and server. This repository contains my solution to Homework 4, which extends Homework 3 into a complete full-stack web application using FastAPI (backend) and React (frontend).

## Folder Structure
.
├── client/             # React frontend (mostly unchanged from HW3)
├── server/             # FastAPI backend
│   ├── main.py
│   ├── import_data.py
│   ├── data_scheme.py
│   ├── data/
│   │   ├── stockdata/
│   │   ├── stocknews/
│   │   └── tsne.csv
├── README.md
└── ...

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

## Backend Setup

### Step 1: Navigate to server folder
cd server

### Step 2: Step 2: (Optional but recommended) Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

### Step 3: Install backend dependencies
pip install -r requirements.txt

### Step 4: Start local MongoDB server
If using Homebrew (macOS): brew services start mongodb-community

### Step 5: Import your data into MongoDB
Before running this step, ensure your data is inside server/data/ using the structure specified.

python import_data.py

### Step 6: Start the FastAPI server
uvicorn main:app --reload --port 8000
API base: http://localhost:8000
Swagger docs: http://localhost:8000/docs


## Client

For the client part, it should mostly the same as your Homework 4. The only difference in this template is the data fetching part, as the example shown in `App.tsx`, that fetch the data for the drop-down menu with 20 different stocks. You can easily transfer that part into `js` version if needed.

```
cd client
npm install
npm run dev
```

### Notes
Replace test data in server/data/ with your own data from HW1 and HW2.

The dropdown in the UI fetches data from your API server—this is the main connection between front-end and back-end.

All news articles are stored in a single MongoDB collection, indexed by a stock field for efficient querying.

Follow the exact folder structure provided in the assignment. Points will be deducted for incorrect organization.

Your pull request should be created from the hw4 branch and submitted to the original GitHub repository as per the course instructions.
