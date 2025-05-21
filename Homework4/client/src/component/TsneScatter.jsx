import * as d3 from "d3"
import { useEffect, useRef } from "react"
import { debounce, isEmpty } from "lodash"

const margin = { left: 40, right: 20, top: 20, bottom: 60 }

const sectorMap = {
  AAPL: "Tech", MSFT: "Tech", GOOGL: "Tech", META: "Tech", NVDA: "Tech",
  JPM: "Finance", BAC: "Finance", GS: "Finance",
  KO: "Consumer", MCD: "Consumer", NKE: "Consumer",
  XOM: "Energy", CVX: "Energy", HAL: "Energy",
  CAT: "Industrial", MMM: "Industrial",
  UNH: "Health", JNJ: "Health", PFE: "Health",
  DAL: "Transport"
}

const TsneScatter = ({ selectedStock }) => {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue
          const { width, height } = entry.contentRect
          if (width && height) {
            fetchAndDraw(width, height)
          }
        }
      }, 100)
    )

    resizeObserver.observe(containerRef.current)
    const { width, height } = containerRef.current.getBoundingClientRect()
    if (width && height) {
      fetchAndDraw(width, height)
    }

    return () => resizeObserver.disconnect()
  }, [selectedStock])

  const fetchAndDraw = (width, height) => {
    const url = `http://localhost:8000/tsne/`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map(d => ({
          x: +d.x,
          y: +d.y,
          stock: d.Stock,
          sector: sectorMap[d.Stock] || "Other"
        }))
        if (!isEmpty(parsed)) {
          drawChart(svgRef.current, parsed, width, height, selectedStock)
        }
      })
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  )
}

export default TsneScatter

function drawChart(svgElement, data, width, height, selectedStock) {
  const svg = d3.select(svgElement)
  svg.selectAll("*").remove()

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .nice()
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .nice()
    .range([height - margin.bottom, margin.top])

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain([...new Set(data.map(d => d.sector))])

  const gContent = svg.append("g").attr("class", "content")

  gContent.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))

  gContent.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))

  gContent.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", d => d.stock === selectedStock ? 10 : 5)
    .attr("fill", d => colorScale(d.sector))
    .attr("stroke", d => d.stock === selectedStock ? "black" : "none")
    .attr("stroke-width", d => d.stock === selectedStock ? 2 : 0)

  if (selectedStock) {
    const selected = data.find(d => d.stock === selectedStock)
    if (selected) {
      gContent.append("text")
        .attr("x", xScale(selected.x) + 12)
        .attr("y", yScale(selected.y) - 12)
        .text(selected.stock)
        .attr("font-size", "0.8rem")
        .attr("font-weight", "bold")
        .attr("fill", "black")
    }
  }

  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`)
  const sectors = [...new Set(data.map(d => d.sector))]
  sectors.forEach((sector, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`)
    g.append("rect").attr("width", 10).attr("height", 10).attr("fill", colorScale(sector))
    g.append("text").attr("x", 15).attr("y", 10).text(sector).style("font-size", "0.8rem")
  })

  const zoom = d3.zoom()
    .scaleExtent([0.5, 20])
    .on("zoom", (event) => {
      gContent.attr("transform", event.transform)
    })

  svg.call(zoom)
}
