import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 120, top: 20, bottom: 60, legendRight: 20 };

const legendProps = ["Energy", "Industrials", "Consumer", "Healthcare", "Financials", "Tech"];

const sectorMap = {
    'XOM': 'Energy',
    'CVX': 'Energy',
    'HAL': 'Energy',
    'MMM': 'Industrials',
    'CAT': 'Industrials',
    'DAL': 'Industrials',
    'MCD': 'Consumer',
    'NKE': 'Consumer',
    'KO':  'Consumer',
    'JNJ': 'Healthcare',
    'PFE': 'Healthcare',
    'UNH': 'Healthcare',
    'JPM': 'Financials',
    'GS':  'Financials',
    'BAC': 'Financials',
    'AAPL': 'Tech',
    'MSFT': 'Tech',
    'NVDA': 'Tech',
    'GOOGL': 'Tech',
    'META': 'Tech'
}
  
export function ScatterPlot({ticker}) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [tickerZData, setTickerZData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/tsne")
            .then((res) => res.json())
            .then((data) => setTickerZData(data.ZData));       
    }, []);
    
    useEffect(() => {
        if (!containerRef.current || !svgRef.current || !tickerZData) return;

        // Resize when container changes sizes
        const resizeObserver = new ResizeObserver(
        debounce((entries) => {
            for (const entry of entries) {
                if (entry.target !== containerRef.current) continue;
                const { width, height } = entry.contentRect;
                if (width && height && !isEmpty(tickerZData)) {
                    drawChart(svgRef.current, tickerZData, width, height, ticker);
                }
            }
        }, 100) // wait at least 100 ms
        );

        resizeObserver.observe(containerRef.current);

        // Draw initially based on starting size
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width && height) {
            drawChart(svgRef.current, tickerZData, width, height, ticker);
        }

        return () => resizeObserver.disconnect();
    }, [ticker, tickerZData]);

    return (
        <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <svg id="bar-svg" ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
}

function drawChart(svgElement, data, width, height, ticker){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // clear previous render

    // Specs for the axes
    const xExtents = d3.extent(data.map((d) => 1.1*d.x));
    const yExtents = d3.extent(data.map((d) => 1.1*d.y));

    const xScale = d3.scaleLinear()
        .range([margin.left, width - margin.right])
        .domain([xExtents[0], xExtents[1]]);

    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([yExtents[0], yExtents[1]]);
        
    // Draw the x axis
    const xAxis = svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
    // Draw the y axis
    const yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));
    // X axis label
    svg.append('g')
        .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
        .append('text')
        .text('t-SNE x Value')
        .style('font-size', '.8rem');
    // Y axis label
    svg.append('g')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .text('t-SNE y Value')
        .style('font-size', '.8rem');
    // Clip points outside of axes
    // Clipping code adapted from https://d3-graph-gallery.com/graph/interactivity_zoom.html
    svg.append('defs').append('SVG:clipPath')
        .attr('id', 'clipScatter')
        .append('SVG:rect')
        .attr('width', width - margin.right - margin.left)
        .attr('height', height - margin.bottom - margin.top)
        .attr('x', margin.left)
        .attr('y', margin.top);
    // Plot points
    const dots = svg.append('g')
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'teal')
        .attr('class', (d) => `tsne-point tsne-point-${sectorMap[d.Stock]}`)
        .attr('id', (d) => `tsne-point-${d.Stock}`)
        .attr('clip-path', 'url(#clipScatter)');
    // Ticker symbol text
    const dotLabels = svg.append('g')
        .selectAll('text')
        .data(data)
        .join('text')
        .text((d) => d.Stock)
        .attr('x', (d) => xScale(d.x))
        .attr('y', (d) => yScale(d.y))
        .attr('dy', -18)
        .attr('visibility', 'hidden')
        .attr('text-anchor', 'middle')
        .attr('class', 'tsne-label')
        .attr('id', (d) => `tsne-label-${d.Stock}`)
        .attr('clip-path', 'url(#clipScatter)');

    // Draw the legend
    for(let i = 0; i < legendProps.length; i++){
        svg.append('g')
            .append('text')
            .attr('transform', `translate(${width - margin.right + 40}, ${margin.top + 10 + 17 * i})`)
            .text(legendProps[i])
            .style('font-size', '.8rem')
        svg.append('g')
            .append('circle')
            .attr('cx', width - margin.right + 25)
            .attr('cy', margin.top + 5 + 17 * i)
            .attr('r', 5)
            .attr('class', `tsne-point-${legendProps[i]}`);
    }
    
    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', (e) => {
            // Get zoom factor
            const newScaleX = e.transform.rescaleX(xScale);
            const newScaleY = e.transform.rescaleY(yScale);
            // Scale the axes
            xAxis.call(d3.axisBottom(newScaleX));
            yAxis.call(d3.axisLeft(newScaleY));
            // Redraw dots
            dots
                .attr('cx', (d) => newScaleX(d.x))
                .attr('cy', (d) => newScaleY(d.y));
            dotLabels
                .attr('x', (d) => newScaleX(d.x))
                .attr('y', (d) => newScaleY(d.y))
        });

    svg.call(zoom);

    changeTicker(ticker);
}

function changeTicker(selectedTicker) {
    // 1. First, reset all dots back to normal
    d3.selectAll('.tsne-point')
        .transition()
        .duration(250)
        .ease(d3.easeBounce)
        .attr('r', 5);

    d3.selectAll('.tsne-label')
        .attr('visibility', 'hidden');

    // 2. Then enlarge the selected dot
    d3.select(`#tsne-point-${selectedTicker}`)
        .attr('r', 5)
        .transition()
        .duration(250)
        .ease(d3.easeBounce)
        .attr('r', 15);

    d3.select(`#tsne-label-${selectedTicker}`)
        .attr('visibility', 'visible');
}