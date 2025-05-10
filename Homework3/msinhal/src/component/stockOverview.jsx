import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

function StockOverview({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!selectedStock || !containerRef.current || !svgRef.current) {
      console.warn('StockOverview: Missing required refs or selectedStock');
      return;
    }

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const visibleWidth = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 400; // fallback height
    const totalWidth = visibleWidth * 3;

    console.log('Initializing chart with width:', totalWidth, 'and height:', height);

    d3.select(svgRef.current).selectAll('*').remove();

    d3.csv(`/data/stockdata/${selectedStock}.csv`).then(data => {
      console.log('Raw CSV data:', data.slice(0, 3)); // preview first 3 rows

      const parseDate = d3.isoParse; // ISO-compatible date parser
      data.forEach(d => {
        d.Date = parseDate(d.Date);
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
      });

      data = data.filter(d => d.Date && !isNaN(d.Open));

      console.log('Parsed & filtered data:', data.slice(0, 3)); // preview first 3 rows again
      if (data.length === 0) {
        console.error('No valid data after parsing. Check CSV formatting.');
        return;
      }

      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([margin.left, totalWidth - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([
          d3.min(data, d => d.Low),
          d3.max(data, d => d.High)
        ])
        .range([height - margin.bottom, margin.top]);

      console.log('xScale domain:', xScale.domain());
      console.log('yScale domain:', yScale.domain());

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
        console.log(`Rendered line for ${key}`);
      });

      const legend = svg.selectAll('.legend')
        .data(Object.keys(colorMap))
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${margin.left + i * 80},${margin.top})`);

      legend.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', d => colorMap[d]);

      legend.append('text')
        .text(d => d)
        .attr('x', 15)
        .attr('y', 10)
        .style('font-size', '0.8rem');

      console.log('Legend rendered');
    }).catch(error => {
      console.error('Error loading CSV:', error);
    });
  }, [selectedStock]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default StockOverview;
