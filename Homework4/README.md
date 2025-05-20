# Homework 4 ReadMe

This folder contains two parts, client and server. AI was used to help me learn some of the statements of FastAPI.
This project was successfully tested and runs on Windows and VS Code. 

## Server

For the server part, make sure you have the respective packages installed. 
```
cd .\Homework4\server\
pip install -r requirements.txt
```

Secondly, make sure you have already installed and started your mongoDB local server.
For example, for mongodb managed with homebrew, run:
```
brew services start mongodb-community
```
Or on Windows, open a new command prompt terminal as administator and just execute the single command:
```
net start MongoDB
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

Same as Homework 3 code, but connected by the API and grabbing data from the Database

```
cd .\Homework4\client\
npm install
npm run dev
```
