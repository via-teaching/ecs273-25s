// src/component/StockOverview.jsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

function StockOverview({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!selectedStock || !containerRef.current || !svgRef.current) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const visibleWidth = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const totalWidth = visibleWidth * 3;  // e.g., 3x scrollable width

    d3.select(svgRef.current).selectAll('*').remove();

    d3.csv(`/data/stockdata/${selectedStock}.csv`).then(data => {
      data.forEach(d => {
        d.Date = d3.timeParse('%Y-%m-%d')(d.Date);
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
      });

      data = data.filter(d => d.Date && !isNaN(d.Open));

      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([margin.left, totalWidth - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([
          d3.min(data, d => d.Low),
          d3.max(data, d => d.High)
        ])
        .range([height - margin.bottom, margin.top]);

      const colorMap = { Open: 'blue', High: 'green', Low: 'red', Close: 'black' };

      const line = key => d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d[key]));

      const svg = d3.select(svgRef.current)
        .attr('width', totalWidth)
        .attr('height', height);

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

      Object.keys(colorMap).forEach(key => {
        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', colorMap[key])
          .attr('stroke-width', 1.5)
          .attr('d', line(key));
      });

      const legend = svg.selectAll('.legend')
        .data(Object.keys(colorMap))
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${margin.left + i * 80},${margin.top})`);
      legend.append('rect').attr('width', 10).attr('height', 10).attr('fill', d => colorMap[d]);
      legend.append('text').text(d => d).attr('x', 15).attr('y', 10).style('font-size', '0.8rem');
    });
  }, [selectedStock]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}


export default StockOverview;
