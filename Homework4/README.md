## HW4

This folder contains two parts, client and server.

## Server
```
cd Homework4/server

```
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
```
cd Homework4/client
```
For the client part, it should mostly the same as your Homework 4. The only difference in this template is the data fetching part, as the example shown in `App.tsx`, that fetch the data for the drop-down menu with 20 different stocks. You can easily transfer that part into `js` version if needed.

<!-- ```
cd client
npm install
npm run dev
``` -->
Each template is self-contained. Navigate into a folder and install dependencies:
```bash
npm install
npm install vite@5.2.9 --save-dev
npm run dev
```
Then open link in local browser.







## Note to Grader:
### Just a reminder, I mentioned in class that my stockdata dataset is only 3 months not 2 years, 
### and as I showed in class ... yfinance api is down, which is prohibiting me from executing my HW1 code (or running ur HW1 solution) to regenerate the stockdata
### You said that's fine, since this does not really test anything conceptually, so I am just putting a reminder 

### If you want, you can replace my "data" folder if you have access to stock data beofre the API went down, to see visually a larger set of data shown.

### Thanks again!
