import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface StockData {
  Open: number;
  High: number;
  Low: number;
  Close: number;
}

interface StockLineChartProps {
  selectedStock: string;
}

const StockLineChart: React.FC<StockLineChartProps> = ({ selectedStock }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 200,
  });
  const [stockData, setStockData] = useState<StockData[]>([]);

  const margin = { top: 20, right: 30, bottom: 70, left: 50 };

  const lineColors: Record<string, string> = {
    Open: "blue",
    High: "green",
    Low: "red",
    Close: "orange",
  };

  const updateDimensions = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({
        width: offsetWidth,
        height: offsetHeight,
      });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const fetchDataAndRenderChart = async () => {
      try {
        const response = await fetch(`http://localhost:8000/stock/${selectedStock}`);
        const data = await response.json();

        // Map the API response to the expected format
        const formattedData = data.stock_series.map((d: any) => ({
          Open: d.Open,
          High: d.High,
          Low: d.Low,
          Close: d.Close,
        }));

        setStockData(formattedData);

        if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear().domain([0, formattedData.length - 1]).range([0, width]);
        const yScale = d3
          .scaleLinear()
          .domain([
            d3.min(formattedData, (d: StockData) => Math.min(d.Open, d.High, d.Low, d.Close))!,
            d3.max(formattedData, (d: StockData) => Math.max(d.Open, d.High, d.Low, d.Close))!,
          ])
          .range([height, 0])
          .clamp(true);

        const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat((d) => `Day ${d}`);
        const yAxis = d3.axisLeft(yScale);

        const chart = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const xAxisGroup = chart
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);

        const yAxisGroup = chart.append("g").attr("class", "y-axis").call(yAxis);

        svg
          .append("text")
          .attr("class", "x-axis-label")
          .attr("text-anchor", "middle")
          .attr("x", margin.left + width / 2)
          .attr("y", dimensions.height - 10)
          .text("Time (Days)");

        svg
          .append("text")
          .attr("class", "y-axis-label")
          .attr("text-anchor", "middle")
          .attr("transform", `rotate(-90)`)
          .attr("x", -dimensions.height / 2)
          .attr("y", 15)
          .text("Stock Price");

        const lines = chart.selectAll(".line").data(["Open", "High", "Low", "Close"]).enter();

        const lineGenerator = (key: keyof StockData) =>
          d3
            .line<StockData>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d[key]))(formattedData);

        lines
          .append("path")
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", (key) => lineColors[key as keyof StockData])
          .attr("stroke-width", 2)
          .attr("d", (key) => lineGenerator(key as keyof StockData)!);

        const zoom = d3
          .zoom()
          .scaleExtent([1.085, 5]) // Allow zooming between 1x and 5x
          .translateExtent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", (event) => {
            const transform = event.transform;
            const newXScale = transform.rescaleX(xScale);

            xAxisGroup.call(d3.axisBottom(newXScale));

            chart
              .selectAll(".line")
              .attr(
                "d",
                (key) =>
                  d3
                    .line<StockData>()
                    .x((_, i) => newXScale(i))
                    .y((d) => yScale(d[key as keyof StockData]))!(formattedData)
              );
          });

        svg.call(zoom as unknown as (selection: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void);

        const legend = svg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left}, ${height + margin.top + 30})`
          );

        const keys = Object.keys(lineColors);
        const legendSpacing = 100;

        keys.forEach((key, index) => {
          const legendRow = legend
            .append("g")
            .attr("transform", `translate(${index * legendSpacing}, 0)`);

          legendRow
            .append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", lineColors[key]);

          legendRow
            .append("text")
            .attr("x", 15)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text(key);
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchDataAndRenderChart();
  }, [selectedStock, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};

export default StockLineChart;