# Homework 3 ReadMe

AI and various online resources were used to help me learn D3 syntax for interactive chart rendering. 
Some sections utilized code from existing templates, but significant modification was still made to the templates. 

Primary templates used:
Source: options.tsx
Line-chart Source: https://observablehq.com/@d3/line-chart/2
Scatterplot Source: https://observablehq.com/@d3/zoomable-area-chart
Legend Source: https://d3-graph-gallery.com/graph/custom_legend.html

## Running the code

The folder with my code is self-contained with all dependencies and environment requirements included. 
Navigate into my pprabhu folder and install dependencies and run the code with the below commands:

```bash
cd pprabhu
npm install
npm run dev
```
Then click localhost url displayed in the output. 

## Instruction for the views
### Stock overview line chart: 
For zooming, first place the cursor within the boundaries of the line chart (needs to be on a line) and hover the cursor directly over the line/s you wish to zoom into, scrolling the mousewheel up will zoom in, scrolling mousewheel down will zoom out. 

For panning (Horizontal scrolling), you first must zoom in so that a portion of the time series is not visible. Next, place the cursor directly over any line, click and hold the left mouse button, and drag to the left or right to pan. 

### t-SNE Scatterplot: 
For zooming, first place the cursor within the boundaries of the Scatterplot and hover the cursor directly over the area you wish to zoom into, scrolling the mousewheel up will zoom in, scrolling mousewheel down will zoom out. 

For panning, place the cursor directly over any area within the Scatterplot, click and hold the left mouse button, and drag in any direction to pan. 

### News List: 
Hover the cursor over the article you wish to read. Click the article to expand the box displaying the content of the article, clicking the expanded box again will minimize the article back to its original preview. 

## Additional Notes
To avoid issues with fetching news articles, the naming of the articles in the stocknews folder is similar to that in HW1, but was modified to have a much stricter naming convention to only allow alphanumeric characters and underscores. The txt news articles must follow this naming contraints to avoid issues with displaying the articles caused by encodeURI with certain non-alphanumeric characters. 

An additional articles.json file was added to the data folder. This json contains the file names for all the news articles which is needed as the exact path of the files are required for await fetch to get each .txt article. 

tsne.csv contains the two columns, each representing one of the two-dimensional coordinates for each stock for the past two years. It also contains the stockname and sector the stock belongs to, which is needed to properly implement the scatterplot.  