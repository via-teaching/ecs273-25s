import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface StockDataPoint {
  date: Date | string
  open: number
  high: number
  low: number
  close: number
}

interface StockLineChartProps {
  symbol: string
  data: StockDataPoint[]
  width?: number
  height?: number
  margin?: Margin
}

const StockChartWithSelection: React.FC<StockLineChartProps> = ({
  symbol,
  data,
  width = 800,
  height = 400,
  margin = { top: 30, right: 30, bottom: 40, left: 50 },
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // parse string dates if necessary
    const parsed: StockDataPoint[] = data.map(d => ({
      ...d,
      date: typeof d.date === 'string' ? new Date(d.date) : d.date
    }))

    // clear previous
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const iw = width - margin.left - margin.right
    const ih = height - margin.top - margin.bottom

    // original scales
    const x0 = d3.scaleTime()
      .domain(d3.extent(parsed, d => d.date as Date) as [Date, Date])
      .range([0, iw])

    const y = d3.scaleLinear()
      .domain([
        (d3.min(parsed, d => d.low) ?? 0) * 0.99,
        (d3.max(parsed, d => d.high) ?? 0) * 1.01
      ]).nice()
      .range([ih, 0])

    // line generator template
    const lineGenerator = (xScale: d3.ScaleTime<number, number>) =>
      d3.line<StockDataPoint>()
        .x(d => xScale(d.date as Date))
        .y(d => y(d.close))
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

    // clip path for panning
    chart.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', iw)
      .attr('height', ih)

    // axes groups
    const xAxisG = chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x0))

    chart.append('g').attr('class', 'y-axis').call(d3.axisLeft(y))

    // path container
    const linePath = chart.append('path')
      .datum(parsed)
      .attr('clip-path', 'url(#clip)')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator(x0)!) // initial close line

    // zoom behavior
    const zoom = d3.zoom<SVGRectElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [iw, ih]])
      .extent([[0, 0], [iw, ih]])
      .on('zoom', ({ transform }) => {
        // rescale x
        const xNew = transform.rescaleX(x0)
        // update axes & line
        xAxisG.call(d3.axisBottom(xNew))
        linePath.attr('d', lineGenerator(xNew)!)
      })

    // transparent rect to capture zoom events
    chart.append('rect')
      .attr('width', iw)
      .attr('height', ih)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(zoom)

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

  return <svg ref={svgRef} width={width} height={height} />
}

export default StockChartWithSelection

