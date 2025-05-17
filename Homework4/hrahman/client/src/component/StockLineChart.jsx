import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function StockLineChart({ selectedTicker }) {
  const svgRef = useRef();
  const yAxisRef = useRef();
  const zoomRef = useRef();
  const [data, setData] = useState([]);
  const zoomTransformRef = useRef();

  const lineTypes = ["Open", "High", "Low", "Close"];
  const colorMap = {
    Open: "#1f77b4",
    High: "#2ca02c",
    Low: "#ff7f0e",
    Close: "#d62728"
  };

  useEffect(() => {
    if (!selectedTicker) return;

    fetch(`http://localhost:8000/stock/${selectedTicker}`)
      .then(res => res.json())
      .then(json => {
        const parsed = json.stock_series
          .filter(d => d.date && d.Open !== undefined)
          .map(d => ({
            ...d,
            Date: new Date(d.date)
          }));
        setData(parsed);
      });
  }, [selectedTicker]);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const yAxisSvg = d3.select(yAxisRef.current);
    yAxisSvg.selectAll("*").remove();

    const margin = { top: 30, right: 120, bottom: 50, left: 0 };
    const fullWidth = Math.max(1200, data.length * 4);
    const height = 300;
    const chartWidth = fullWidth;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(0,${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, chartWidth])
      .clamp(true);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.Open, d.High, d.Low, d.Close)),
        d3.max(data, d => Math.max(d.Open, d.High, d.Low, d.Close))
      ])
      .nice()
      .range([chartHeight, 0]);

    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    const yAxisGroup = yAxisSvg.append("g")
      .attr("transform", `translate(60,30)`)
      .call(d3.axisLeft(yScale));

    yAxisGroup.select(".domain").attr("stroke", "black");
    yAxisGroup.selectAll("line").attr("stroke", "#aaa");

    yAxisSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Price")
      .style("font-size", "0.8rem");

    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 40)
      .attr("text-anchor", "middle")
      .text("Date")
      .style("font-size", "0.8rem");

    const chartBody = g.append("g").attr("class", "chart-body");

    lineTypes.forEach(type => {
      const line = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d[type]));

      chartBody.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[type])
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr("class", `line-${type}`);
    });

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [chartWidth, chartHeight]])
      .extent([[0, 0], [chartWidth, chartHeight]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        zoomTransformRef.current = event.transform;
        xAxisGroup.call(d3.axisBottom(newX));

        lineTypes.forEach(type => {
          const line = d3.line()
            .x(d => newX(d.Date))
            .y(d => yScale(d[type]));
          chartBody.select(`.line-${type}`).attr("d", line(data));
        });
      });

    svg.call(zoom);
    zoomRef.current = zoom;
    zoomTransformRef.current = d3.zoomIdentity;

  }, [data]);

  const handleZoom = (factor) => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="absolute top-2 right-40 z-50 bg-white/90 backdrop-blur p-2 rounded shadow text-sm flex flex-row items-center gap-4">
        {lineTypes.map(type => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorMap[type] }}></div>
            <span className="text-gray-800">{type}</span>
          </div>
        ))}
      </div>

      {/* Zoom Buttons */}
      <div className="absolute top-2 right-2 z-50 bg-white/90 backdrop-blur-sm flex items-center gap-2 p-1 rounded shadow-md">
        <button onClick={() => handleZoom(1.2)} className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded">+</button>
        <button onClick={() => handleZoom(0.8)} className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded">−</button>
        <button onClick={handleReset} className="px-2 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded">Reset</button>
      </div>

      {/* Chart Area */}
      <div className="flex w-full">
        <svg ref={yAxisRef} width={60} height={300} />
        <div className="overflow-x-auto w-full">
          <svg
            ref={svgRef}
            width={Math.max(1200, data.length * 4.01)}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}