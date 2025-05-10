import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

function TSNEScatter({ selectedStock }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear any existing svg content
    d3.select(svgRef.current).selectAll('*').remove();

    // Load data
    d3.csv('/data/tsne.csv').then(data => {
      data.forEach(d => {
        d.x = +d.x;
        d.y = +d.y;
      });

      // Scales
      const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height - margin.bottom, margin.top]);

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const g = svg.append('g');

      // Axes
      const xAxis = svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      const yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

      // Points
      g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', d => d.label === selectedStock ? 8 : 4)
        .attr('fill', (d, i) => colorScale(i));

      // Selected stock label
      g.selectAll('text')
        .data(data.filter(d => d.label === selectedStock))
        .enter()
        .append('text')
        .attr('x', d => xScale(d.x))
        .attr('y', d => yScale(d.y) - 10)
        .attr('text-anchor', 'middle')
        .text(d => d.label)
        .style('font-size', '0.8rem');

      // ✅ Zoom behavior (fixed: no axis clearing!)
      const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', (event) => {
          const newXScale = event.transform.rescaleX(xScale);
          const newYScale = event.transform.rescaleY(yScale);

          // Redraw axes without manual clearing
          xAxis.call(d3.axisBottom(newXScale));
          yAxis.call(d3.axisLeft(newYScale));

          // Update positions
          g.selectAll('circle')
            .attr('cx', d => newXScale(d.x))
            .attr('cy', d => newYScale(d.y));

          g.selectAll('text')
            .attr('x', d => newXScale(d.x))
            .attr('y', d => newYScale(d.y) - 10);
        });

      svg.call(zoom);
    });
  }, [selectedStock]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default TSNEScatter;