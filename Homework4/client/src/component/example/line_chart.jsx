import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce } from "lodash";

const margin = { left: 50, right: 20, top: 20, bottom: 30 };
const pixelsPerMonth = 80;
const monthsVisible = 12;

export function LineChart() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomLevelRef = useRef(1);

useEffect(() => {
  if (!containerRef.current || !svgRef.current) return;

  const resizeObserver = new ResizeObserver(
    debounce((entries) => {
      for (const entry of entries) {
        if (entry.target !== containerRef.current) continue;
        const { height } = entry.contentRect;
        const width = monthsVisible * pixelsPerMonth;
        updateChart(width, height, svgRef.current, zoomLevelRef.current, containerRef.current);
      }
    }, 100)
  );

  resizeObserver.observe(containerRef.current);

  // ✅ Wait until dropdown is ready
  const interval = setInterval(() => {
    const dropdown = document.getElementById("bar-select");
    if (dropdown && dropdown.value) {
      const { height } = containerRef.current.getBoundingClientRect();
      const width = monthsVisible * pixelsPerMonth;
      updateChart(width, height, svgRef.current, zoomLevelRef.current, containerRef.current);
      clearInterval(interval);
    }
  }, 100); // check every 100ms

  return () => {
    resizeObserver.disconnect();
    clearInterval(interval);
  };
}, []);


  const handleZoom = (delta) => {
    zoomLevelRef.current = Math.max(1, zoomLevelRef.current + delta);
    const { height } = containerRef.current.getBoundingClientRect();
    const width = monthsVisible * pixelsPerMonth;
    updateChart(width, height, svgRef.current, zoomLevelRef.current, containerRef.current);
  };

  const handleReset = () => {
    zoomLevelRef.current = 1;
    const { height } = containerRef.current.getBoundingClientRect();
    const width = monthsVisible * pixelsPerMonth;
    updateChart(width, height, svgRef.current, zoomLevelRef.current, containerRef.current);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex justify-between items-center px-2 pt-1 mb-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block" />Open</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full inline-block" />High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block" />Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-full inline-block" />Close</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => handleZoom(1)} className="px-2 py-1 bg-yellow-300 border-2 border-black rounded">Zoom In</button>
          <button onClick={() => handleZoom(-1)} className="px-2 py-1 bg-yellow-300 border-2 border-black rounded">Zoom Out</button>
          <button onClick={handleReset} className="px-2 py-1 bg-yellow-300 border-2 border-black rounded">Reset</button>
        </div>
      </div>

      <div className="flex w-full flex-1">
        <div className="flex-none" style={{ width: `${margin.left}px` }}>
          <svg height="100%" width="100%">
            <g id="y-axis" transform={`translate(${margin.left - 1}, 0)`}></g>
            <text
              transform="rotate(-90)"
              x={-margin.top - 75}
              y={8}
              dy="1em"
              textAnchor="middle"
              fontSize="12"
              fill="black"
            >
              Price
            </text>
          </svg>
        </div>

        <div
          ref={containerRef}
          className="flex-1 h-full"
          style={{ overflowX: "scroll", scrollbarWidth: "none" }}
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              containerRef.current.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          <svg ref={svgRef} id="scroll-svg" height="100%" />
        </div>
      </div>
    </div>
  );
}

async function updateChart(width, height, svgEl, zoomLevel = 1, scrollContainer = null) {
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();

  const selectedStock = d3.select("#bar-select").property("value");
  if (!selectedStock) return;

  try {
    const res = await fetch(`http://localhost:8000/stock/${selectedStock}`);
    const { stock_series: rawData } = await res.json();

    const data = rawData.map(d => ({
      Date: new Date(d.date),
      Open: +d.Open,
      High: +d.High,
      Low: +d.Low,
      Close: +d.Close,
    }));

    if (data.length === 0) return;

    const startDate = d3.min(data, d => d.Date);
    const endDate = d3.max(data, d => d.Date);
    const totalMonths = d3.timeMonth.count(startDate, endDate) + 1;
    const fullWidth = totalMonths * pixelsPerMonth;
    const zoomedWidth = fullWidth * zoomLevel;

    svg.attr("width", zoomedWidth + margin.right);

    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, zoomedWidth]);

    const yValues = data.flatMap(d => [d.Open, d.High, d.Low, d.Close]);
    const yScale = d3.scaleLinear()
      .domain([d3.min(yValues), d3.max(yValues)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineGenerator = key => d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d[key]));

    const colorMap = {
      Open: "blue",
      High: "green",
      Low: "red",
      Close: "orange",
    };

    const chartGroup = svg.append("g").attr("class", "chart-area");

    ["Open", "High", "Low", "Close"].forEach(key => {
      chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[key])
        .attr("stroke-width", 0.85)
        .attr("d", lineGenerator(key));
    });

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y")));

    d3.select("#y-axis").call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("x", zoomedWidth / 2)
      .attr("y", height)
      .attr("text-anchor", "middle")
      .attr("dy", "-4px")
      .attr("font-size", "12px")
      .text("Date");

    d3.select("#bar-select").on("change", () => {
      const { height } = svgEl.getBoundingClientRect();
      const width = monthsVisible * pixelsPerMonth;
      updateChart(width, height, svgEl, zoomLevel, scrollContainer);
    });

  } catch (err) {
    console.error("Chart rendering error:", err);
  }
}
