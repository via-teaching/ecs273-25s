// src/components/StockLineChart.jsx
import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export default function StockChartWithSelection({
  symbol = 'AAPL',
  width = 800,
  height = 400,
  margin = { top: 30, right: 30, bottom: 40, left: 50 },
}) {
  const svgRef = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load & parse CSV whenever symbol changes
  useEffect(() => {
    setLoading(true)
    setError(null)

    d3.csv(`data/stockdata/${symbol}.csv`, (row) => {
      // turn "2023-04-12 00:00:00-04:00" into a JS Date
      const date = new Date(row.Date.replace(' ', 'T'))
      return {
        date,
        open:  +row.Open,
        high:  +row.High,
        low:   +row.Low,
        close: +row.Close,
      }
    })
    .then((parsed) => {
      const clean = parsed.filter(d => d.date instanceof Date && !isNaN(d.date))
      setData(clean)
      setLoading(false)
    })
    .catch((err) => {
      console.error(err)
      setError('Failed to load stock data')
      setLoading(false)
    })
  }, [symbol])

  // Draw chart & enable zoom
  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const iw = width - margin.left - margin.right
    const ih = height - margin.top - margin.bottom

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, iw])

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.low) * 0.99,
        d3.max(data, d => d.high) * 1.01
      ]).nice()
      .range([ih, 0])

    const makeLine = key => d3.line()
      .x(d => x(d.date))
      .y(d => y(d[key]))
      .curve(d3.curveMonotoneX)

    // chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${symbol} Stock Price`)

    // clipping
    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', iw)
      .attr('height', ih)

    // axes
    const xAxisG = chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x))

    chart.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))

    // lines
    const linesGroup = chart.append('g').attr('clip-path', 'url(#clip)')
    const lines = [
      { key: 'open',  color: '#1f77b4', label: 'Open' },
      { key: 'high',  color: '#2ca02c', label: 'High' },
      { key: 'low',   color: '#d62728', label: 'Low' },
      { key: 'close', color: '#ff7f0e', label: 'Close' }
    ]
    lines.forEach(({ key, color }) => {
      linesGroup.append('path')
        .datum(data)
        .attr('class', `line line-${key}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', makeLine(key))
    })

    // zoom behavior
    const zoomed = ({ transform }) => {
      const zx = transform.rescaleX(x)
      xAxisG.call(d3.axisBottom(zx))
      lines.forEach(({ key }) => {
        linesGroup.select(`.line-${key}`)
          .attr('d', d3.line()
            .x(d => zx(d.date))
            .y(d => y(d[key]))
            .curve(d3.curveMonotoneX)(data)
          )
      })
    }

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [iw, ih]])
      .extent([[0, 0], [iw, ih]])
      .on('zoom', zoomed)

    chart.append('rect')
      .attr('width', iw)
      .attr('height', ih)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('cursor', 'move')
      .call(zoom)

    // legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left +10},${margin.top})`)

    lines.forEach(({ color, label }, i) => {
      const yOff = i * 20
      legend.append('line')
        .attr('x1', 0).attr('y1', yOff)
        .attr('x2', 20).attr('y2', yOff)
        .attr('stroke', color).attr('stroke-width', 2)
      legend.append('text')
        .attr('x', 25).attr('y', yOff + 4)
        .text(label)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle')
    })

    // axis labels
    chart.append('text')
      .attr('x', iw / 2)
      .attr('y', ih + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Date')

    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -ih / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Price ($)')
  }, [data, width, height, margin, symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <p className="text-lg">Loading {symbol} data…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    )
  }

  return <svg ref={svgRef} width={width} height={height} />
}