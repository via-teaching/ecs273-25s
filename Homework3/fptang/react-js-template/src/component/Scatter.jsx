import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export default function ScatterPlot({
  symbol = 'AAPL',
  width = 800,
  height = 400,
  margin = { top: 30, right: 20, bottom: 40, left: 100 },
}) {
  const svgRef = useRef(null)
  const [data, setData] = useState([])

  // Load CSV once
  useEffect(() => {
    d3.csv('data/tsne_projection.csv', d => ({
      x: +d.TSNE1,
      y: +d.TSNE2,
      ticker: d.ticker,
      sector: d.sector,
    })).then(rows => {
      setData(rows)
    })
  }, [])

  // Draw & update when data or symbol changes
  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // **Title**
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${symbol} TSNE Projection`)

    // scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x)).nice()
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y)).nice()
      .range([innerHeight, 0])

    const sectors = Array.from(new Set(data.map(d => d.sector)))
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(sectors)

    // zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('zoom', zoomed)

    // root group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .call(zoom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // axes
    const xAxisG = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    const yAxisG = g.append('g')
      .call(d3.axisLeft(yScale))

    // axis labels
    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .text('TSNE1')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', - (margin.top + innerHeight / 2))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('TSNE2')

    // points
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.ticker === symbol ? 8 : 4)
      .attr('fill', d => colorScale(d.sector))
      .append('title')
      .text(d => d.ticker)

    // highlight label
    const sel = data.find(d => d.ticker === symbol)
    if (sel) {
      g.append('text')
        .datum(sel)
        .attr('class', 'selected-label')
        .attr('x', d => xScale(d.x) + 10)
        .attr('y', d => yScale(d.y) + 5)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(d => d.ticker)
    }

    // legend
    const legend = g.append('g').attr('transform', `translate(20, 0)`)
    sectors.forEach((sect, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 20})`)
      row.append('rect').attr('width', 12).attr('height', 12).attr('fill', colorScale(sect))
      row.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .style('font-size', '12px')
        .text(sect)
    })

    function zoomed({ transform }) {
      const zx = transform.rescaleX(xScale)
      const zy = transform.rescaleY(yScale)

      xAxisG.call(d3.axisBottom(zx))
      yAxisG.call(d3.axisLeft(zy))

      g.selectAll('circle')
        .attr('cx', d => zx(d.x))
        .attr('cy', d => zy(d.y))

      g.selectAll('.selected-label')
        .attr('x', d => zx(d.x) + 10)
        .attr('y', d => zy(d.y) + 5)
    }
  }, [data, symbol, width, height, margin])

  return <svg ref={svgRef} />
}