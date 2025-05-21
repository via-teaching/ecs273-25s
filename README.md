# ECS273 Homework3 running instructions
This homework is done with the help of GPT

## 1. get into the right folder
The path is: ecs273-25s/Homework3/qiatan

## 2. using the command to run
Enter npm run dev in the terminal



# ECS273 Homework4 running instructions
This homework is done with the help of GPT

### backend

**1. Navigate to the backend folder**

```
cd server
```

**2. Install required Python packages**

```
pip install -r requirements.txt
```

**3. Make sure MongoDB is running**
If using Homebrew on macOS:

```
brew services start mongodb-community
```

**4. Import data into the database (if required)**

```
python import_data.py
```

**5. Run the FastAPI server**

```
uvicorn main:app --reload --port 8000
```

API Docs available at: http://localhost:8000/docs

### frontend

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
