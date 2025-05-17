# Homework 4 Templates

This folder contains two parts, client and server.

## Server(Based on the Windows system)

For the server part, make sure you have the respective packages installed by this command.

```
pip install -r requirements.txt
```

Secondly, make sure you have already installed and started your mongoDB local server.
Right click the "start" button and open the "Terminal (Administrator)", input:

```
net start MongoDB
```
Then, open the "MongoDBCompass" software,choose the "stock_zlihuang" and click the "CONNECT" button

After that, put your data into database with:

```
python import_data.py
```

Next, start your api server by,

```
uvicorn main:app --reload --port 8000
```
You can use http://localhost:8000/docs to see the API content

Finally, when you don't need to run the program, right click the "start" button and open the "Terminal (Administrator)", input:

```
net stop MongoDB
```
## Client

For the client part, it should mostly the same as your Homework 4. The only difference in this template is the data fetching part, as the example shown in `App.tsx`, that fetch the data for the drop-down menu with 20 different stocks. You can easily transfer that part into `js` version if needed.

```
cd client
npm install
npm run dev
```


Tip: The part of homework is done with help of ChatGPT.