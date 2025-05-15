# Homework 4 Templates

This folder contains two parts, client and server.

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

## Client

For the client part, it should mostly the same as your Homework 4. The only difference in this template is the data fetching part, as the example shown in `App.tsx`, that fetch the data for the drop-down menu with 20 different stocks. You can easily transfer that part into `js` version if needed.

```
cd client
npm install
npm run dev
```


```
How to Run
1. Cd into grzsun folder
2. Cd into server
3. pip install -r requirements.txt
4. python import_data.py
5. uvicorn main:app --reload --port 8000
6. Open new terminal
7. cd into grzsun folder
8. cd into client
9. npm install
10. npm run dev

Note:
I ran this on windows computer so I don't know how it is going to work on Mac enviroment
Make sure to run API on localhost:8000
Make sure to run frontend on localhost:5173

Gen AI Statement:
1. Ask AI about how to install MongoDB
2. Ask AI to explain how FastAPI works and about what response_model mean
3. Ask AI about how to use async and await for import_data.py
4. Ask AI about some functions syntax for MongoDB
```
