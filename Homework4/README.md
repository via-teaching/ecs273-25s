# ECS273 Homework 4
In this repository, you will find the templates for your homework assignments.
Please refer to the instructions provided on Canvas and the linked Google Docs for detailed requirements and submission guidelines.

To clone this repository, please run:
```
git clone git@github.com:via-teaching/ecs273-25s.git
```

Switch to the respective Homework4 directory using `cd Homework 4`

## Setup Instruction

### A backend instruction example:

**1. Navigate to the backend folder**

```
cd server
```

**2. (Optional but recommended) Set up a Python virtual environment (or conda based on your preference)**

```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install required Python packages**

```
pip install -r requirements.txt
```
In addition, make sure `json`, `os`, `nest_asyncio`, `typing`, and `bson` are installed as well. If not, use the commands below to install them.
```
pip install json os nest_asyncio typing bson
```

**4. Make sure MongoDB is running**
If using Homebrew on macOS:

```
brew services start mongodb-community
```

**5. Import data into the database (if required)**

```
python import_data.py
```

**6. Run the FastAPI server**

```
uvicorn main:app --reload --port 8000
```

API Docs available at: http://localhost:8000/docs

### A frontend instruction example

**1. In a separate terminal, navigate to the frontend folder**

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

## Additional Notes: File Structure

This is how the files are organized:
```
Homework4
- client
  - public
  - src
    - assets
    - components
    - App.jsx
    - index.css
    - main.jsx
- server
  - import_data.py
  - data_scheme.py
  - main.py
  - requirements.txt
- package.json
```
