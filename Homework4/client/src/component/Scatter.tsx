import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ScatterDatum {
  x: number
  y: number
  ticker: string
  sector: string
}

interface ScatterPlotProps {
  symbol: string
  data: ScatterDatum[]
  width?: number
  height?: number
  margin?: Margin
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  symbol,
  data,
  width = 800,
  height = 400,
  margin = { top: 30, right: 20, bottom: 40, left: 100 },
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const innerWidth  = width  - margin.left - margin.right
    const innerHeight = height - margin.top  - margin.bottom

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${symbol} TSNE Projection`)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .nice()
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .nice()
      .range([innerHeight, 0])

    const sectors = Array.from(new Set(data.map(d => d.sector)))
    const colorScale = d3.scaleOrdinal<string>()
      .domain(sectors)
      .range(d3.schemeCategory10)

    // Zoom handler
    function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
      const zx = event.transform.rescaleX(xScale)
      const zy = event.transform.rescaleY(yScale)

      xAxisG.call(d3.axisBottom(zx))
      yAxisG.call(d3.axisLeft(zy))

      g.selectAll<SVGCircleElement, ScatterDatum>('circle')
        .attr('cx', d => zx(d.x))
        .attr('cy', d => zy(d.y))

      g.selectAll<SVGTextElement, ScatterDatum>('.selected-label')
        .attr('x', d => zx(d.x) + 10)
        .attr('y', d => zy(d.y) + 5)
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('zoom', zoomed)

    // Root group with zoom
    const g = svg.call(zoom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    // Axes groups
    const xAxisG = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    const yAxisG = g.append('g')
      .call(d3.axisLeft(yScale))

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .text('TSNE1')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerHeight / 2))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('TSNE2')

    // Data points
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.ticker === symbol ? 8 : 4)
      .attr('fill', d => colorScale(d.sector) as string)
      .append('title')
        .text(d => d.ticker)

    // Highlight selected ticker label
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

  }, [data, symbol, width, height, margin])

  return <svg ref={svgRef} width={width} height={height} />
}

export default ScatterPlot

