# ECS 273 HW4
Garrick Chan

garchan@ucdavis.edu

924171125

## Academic Integrity Acknowledgement
Google Gemini in Google search results and ChatGPT were used to learn about the existence of functions in various classes, modules, and packages.

## Server Side
1. Navigate to server folder 
```shell
cd server
```
2. Create a Python Virtual Environment
```shell
python -m venv venv
source venv/bin/activate
```
3. Install Python packages
```shell
pip install -r requirements.txt
```
4. Start local MongoDB on Mac:
```shell
brew services start mongodb-community
```
5. Import data to databse
```shell
python ./import_data.py
```
6. Run the server 
```shell
uvicorn main:app --reload --port 8000
```

## Client Side
1. Navigate to client folder
```shell
cd client
```
2. Install Node packages
```shell
npm install
```
3. Run React server
```shell
npm run dev
```
4. In a web browser, go to `http://localhost:5173` (or whichever path is printed in the console).
