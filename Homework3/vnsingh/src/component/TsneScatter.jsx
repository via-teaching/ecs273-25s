import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// mapping: [{ value: companyName, category: ticker }]
export default function TSNEScatter({ selectedStock, mapping = [], width = 600, height = 400 }) {
  const svgRef = useRef();
  const [points, setPoints] = useState([]);

  // Lookup ticker -> full name
  const tickerToName = useMemo(() => mapping.reduce((acc, m) => {
    acc[m.category] = m.value;
    return acc;
  }, {}), [mapping]);

  useEffect(() => {
    d3.csv('/data/tsne.csv', d => ({
      x: +d.x,
      y: +d.y,
      ticker: d.ticker,
      sector: d.sector
    }))
    .then(data => setPoints(data))
    .catch(err => console.error('Failed to load TSNE data:', err));
  }, []);

  useEffect(() => {
    if (!points.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // group container for zoom
    const container = svg.append('g');

    // Scales
    const xExtent = d3.extent(points, d => d.x);
    const yExtent = d3.extent(points, d => d.y);
    const xScale = d3.scaleLinear().domain(xExtent).range([50, width - 20]);
    const yScale = d3.scaleLinear().domain(yExtent).range([height - 50, 20]);

    // Axes groups
    const gX = container.append('g')
      .attr('transform', `translate(0, ${height - 50})`);
    const gY = container.append('g')
      .attr('transform', `translate(50, 0)`);

    gX.call(d3.axisBottom(xScale));
    gY.call(d3.axisLeft(yScale));

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('t-SNE 1');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('t-SNE 2');

    // Color scale by sector
    const sectors = Array.from(new Set(points.map(d => d.sector)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(sectors);

    // Points group
    const gPoints = container.append('g');
    gPoints.selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.ticker === selectedStock ? 6 : 4)
      .attr('fill', d => colorScale(d.sector))
      .attr('opacity', d => d.ticker === selectedStock ? 1 : 0.7);

    // Label selected
    const sp = points.find(d => d.ticker === selectedStock);
    if (sp) {
      const label = tickerToName[selectedStock] || selectedStock;
      container.append('text')
        .attr('class', 'selected-label')
        .attr('x', xScale(sp.x) + 8)
        .attr('y', yScale(sp.y) - 8)
        .text(label)
        .style('font-size', '12px')
        .style('font-weight', 'bold');
    }

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, 20)`);

    sectors.forEach((s, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
      g.append('rect')
        .attr('width', 12).attr('height', 12)
        .attr('fill', colorScale(s));
      g.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .text(s)
        .style('font-size', '10px');
    });

    // Zoom behavior
    const zoomed = ({ transform }) => {
      const zx = transform.rescaleX(xScale);
      const zy = transform.rescaleY(yScale);
      gX.call(d3.axisBottom(zx));
      gY.call(d3.axisLeft(zy));
      gPoints.selectAll('circle')
        .attr('cx', d => zx(d.x))
        .attr('cy', d => zy(d.y));
      if (sp) {
        d3.select('.selected-label')
          .attr('x', zx(sp.x) + 8)
          .attr('y', zy(sp.y) - 8);
      }
    };

    svg.call(d3.zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed)
    );

  }, [points, selectedStock, tickerToName, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
}
