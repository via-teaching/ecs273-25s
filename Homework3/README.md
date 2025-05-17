# Homework 3 

This repository contains:

- `almyee`: A folder containing react and javascript web app.
    - `data`: contains `stockdata`, `stocknews`, `demo.json`, and `tsne.csv`
    - `src`: contains `component` and `App.jsx`
        - `component`: contains `LineChart.jsx`, `NewsList.jsx`, `options.jsx`, and `TSnePlot.jsx`
            - `LineChart.jsx`: contains the stock overview line chart separated into Open, High, Low, and Close values for each ticker
            - `NewsList.jsx`: contains the list of news of the selected stock and when clicked, expands to reveal the news content
            - `options.jsx`: contains the list of stock tickers 
            - `TSnePlot.jsx`: contains the tsne scatter plot with the stocks organized by sector 
        - `App.jsx`: contains the rendering for each plot and formatting

## Usage

Navigate into the `almyee` folder and install dependencies:

```bash
cd almyee
npm install
npm run dev
```
