import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce } from "lodash";

interface LineChartProps {
  selectedStock: string;
}

interface StockDatum {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

const margin = { left: 50, right: 20, top: 20, bottom: 60 };

export function LineChart({ selectedStock }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height) {
            drawChart(svgRef.current!, selectedStock, width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current, selectedStock, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [selectedStock]);

  return (
    <div
      className="chart-container d-flex"
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        overflowY: "hidden",
      }}
    >
      <svg id="bar-svg" ref={svgRef}></svg>
    </div>
  );
}

async function drawChart(
  svgElement: SVGSVGElement,
  selectedStock: string,
  width: number,
  height: number
): Promise<void> {
  const svg = d3.select<SVGSVGElement, unknown>(svgElement);
  svg.selectAll("*").remove();

  const response = await fetch(`http://localhost:8000/stock/${selectedStock}`);
  const json = await response.json();
  const data: StockDatum[] = json.stock_series.map((d: any) => ({
    date: new Date(d.Date),
    open: d.Open,
    high: d.High,
    low: d.Low,
    close: d.Close,
  }));
  const keys = ["open", "high", "low", "close"] as string[];
  const colors = d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(keys);


  const dateExtent = d3.extent(data, d => d.date);
  if (!dateExtent[0] || !dateExtent[1]) return;

  const xScale = d3
    .scaleTime()
    .domain([dateExtent[0], dateExtent[1]])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.open, d.high, d.low, d.close))!,
      d3.max(data, d => Math.max(d.open, d.high, d.low, d.close))!,
    ])
    .range([height - margin.bottom, margin.top]);

  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height);

  const g = svg.append("g").attr("class", "chart-group");

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);

  const lines: Record<string, d3.Line<any>> = {};
  keys.forEach(key => {
    lines[key] = d3
      .line<any>()
      .x(d => xScale(d.date))
      .y(d => yScale(d[key]));
  });

  keys.forEach(key => {
    g.append("path")
      .datum(data)
      .attr("class", `line-${key}`)
      .attr("fill", "none")
      .attr("stroke", colors(key))
      .attr("stroke-width", 1.5)
      .attr("clip-path", "url(#clip)")
      .attr("d", lines[key]);
  });

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(d3.timeMonth.every(1))
    .tickFormat((domainValue, _) => d3.timeFormat("%Y-%m-%d")(domainValue as Date))

  const xAxisGroup = g
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-20)")
    .style("text-anchor", "end");

  const yAxisGroup = g
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  yAxisGroup.selectAll("text").style("font-size", "8px");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Date");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 + 15)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Price");

  const legend = svg
    .append("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${margin.left}, ${margin.top - 10})`);

  keys.forEach((key, i) => {
    const legendItem = legend.append("g").attr("transform", `translate(${i * 100}, 0)`);

    legendItem.append("rect").attr("width", 20).attr("height", 10).attr("fill", colors(key));

    legendItem
      .append("text")
      .attr("x", 25)
      .attr("y", 6)
      .text(key)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 5])
    .translateExtent([
      [margin.left, 0],
      [width + margin.left, height],
    ])
    .extent([
      [margin.left, 0],
      [width + margin.left, height],
    ])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(xScale);

      keys.forEach(key => {
        const newLine = d3
          .line<any>()
          .x(d => newX(d.date))
          .y(d => yScale(d[key]));
        g.select(`.line-${key}`).attr("d", newLine(data));
      });

      const xAxisSelection = g.select<SVGGElement>(".x-axis");
      xAxisSelection.call(
          d3.axisBottom(newX)
            .ticks(d3.timeMonth.every(1))
            .tickFormat((domainValue, _) => d3.timeFormat("%Y-%m-%d")(domainValue as Date))
        )
        .selectAll("text")
        .attr("transform", "rotate(-20)")
        .style("text-anchor", "end");
    });

  svg.call(zoom);
}
