# Homework 4

## Setup Instructions

### Backend Instructions:
**1. Navigate to the backend folder**

```
cd server
```

**2. (Optional but recommended) Set up a Python virtual environment (or conda based on your preference)**

```
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install required Python packages**

```
pip3 install -r requirements.txt
```

**4. Make sure MongoDB is running**  
If using Homebrew on macOS:

```
brew services start mongodb-community
```

If using linux or wsl:

```
sudo mongod
```

Afterwards, may need to open another terminal for the following steps.

**5. Import data into the database (if required)**  

```
python3 import_data.py
```

**6. Run the FastAPI server**

```
uvicorn main:app --reload --port 8000
```

API Docs available at: http://localhost:8000/docs  
Afterwards, may need to open another terminal for the following steps.

### Frontend Instructions

**1. Navigate to the frontend folder**

```
cd client
```

**2. Install required Node.js packages**

```
npm install
```

**3. Start the React development server**

```
npm run dev
```

**4. Visit the frontend in your browser**  
Usually: http://localhost:5173

## Using The Frontend

### Select a stock
- Use the "Select a category:" dropdown to select a stock  

### Stock Overview Line Chart
- Zoom via scrolling with the mouse pointer on the graph
- Click "Reset Zoom" to reset the zoom
- Scroll along the line chart horizontally via the horizontal scroll bar

### T-SNE Scatter Plot
- Zoom via scrolling with the mouse pointer on the graph
- Click "Reset Zoom" to reset the zoom

### List of News
- Click news preview to show its content
- Click on expanded news to hide the content