import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 120, top: 20, bottom: 60, legendRight: 20};

const legendProps = [
    {name: "Open",  color: "#4285F4"},
    {name: "Low",   color: "#F4B400"},
    {name: "High",  color: "#34A853"},
    {name: "Close", color: "#EA4335"}
];

export function LineChart({ticker}){
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [tickerData, setTickerData] = useState(null);

    // Load the correct CSV
    // ticker is passed down from App.jsx
    useEffect(() => {
        d3.csv(`../../data/stockdata/${ticker}.csv`).then(csvData => {
            setTickerData(csvData);
        });
        
    }, [ticker]);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current || !tickerData) return;
        
            const resizeObserver = new ResizeObserver(
                debounce((entries) => {
                    for (const entry of entries) {
                        if (entry.target !== containerRef.current) continue;
                        const { width, height } = entry.contentRect;
                        if (width && height && !isEmpty(tickerData)) {
                            drawChart(svgRef.current, tickerData, width, height);
                        }
                    }
                }, 100)
            );
        
            resizeObserver.observe(containerRef.current);
        
            // Draw initially based on starting size
            const { width, height } = containerRef.current.getBoundingClientRect();
            if (width && height) {
              drawChart(svgRef.current, tickerData, width, height);
            }
        
            return () => resizeObserver.disconnect();
    }, [tickerData])

    return (
        <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
          <svg id="bar-svg" ref={svgRef} width="100%" height="100%"></svg>
        </div>
      );
}

function drawChart(svgElement, dataset, width, height){    
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // clear previous render
    
    const lows = dataset.map((d) => d.Low); 
    const highs = dataset.map((d) => d.High); 
    const combined = lows.concat(highs);
    const yExtents = d3.extent(combined.map(Number));
    const xExtents = d3.extent(dataset.map((d) => {
        return d3.timeParse("%Y-%m-%d")(d.Date);
    }))
    
    const xScale = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(xExtents);

    const yScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain(yExtents);
    
    // Draw the x axis
    const xAxis = svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    // Draw the y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(5));
    // X axis label
    svg.append('g')
        .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
        .append('text')
        .text('Time')
        .style('font-size', '.8rem');
    // Y axis label
    svg.append('g')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .text('Price')
        .style('font-size', '.8rem');
    // Clip points outside of axes
    // Clipping code adapted from https://d3-graph-gallery.com/graph/interactivity_zoom.html
    svg.append('defs').append('SVG:clipPath')
        .attr('id', 'clip')
        .append('SVG:rect')
        .attr('width', width - margin.right - margin.left)
        .attr('height', height - margin.bottom - margin.top)
        .attr('x', margin.left)
        .attr('y', margin.top);
    // Open line
    const openPath = svg.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', legendProps[0].color)
        .attr('stroke-width', 1)
        .attr('clip-path', 'url(#clip)')
        .attr('d', d3.line()
            .x((d) => xScale(d3.timeParse("%Y-%m-%d")(d.Date)))
            .y((d) => yScale(d.Open)));
    // Low line
    const lowPath = svg.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', legendProps[1].color)
        .attr('stroke-width', 1)
        .attr('clip-path', 'url(#clip)')
        .attr('d', d3.line()
            .x((d) => xScale(d3.timeParse("%Y-%m-%d")(d.Date)))
            .y((d) => yScale(d.Low)));
    // High line
    const highPath = svg.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', legendProps[2].color)
        .attr('stroke-width', 1)
        .attr('clip-path', 'url(#clip)')
        .attr('d', d3.line()
            .x((d) => xScale(d3.timeParse("%Y-%m-%d")(d.Date)))
            .y((d) => yScale(d.High)));
    // Close line
    const closePath = svg.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', legendProps[3].color)
        .attr('stroke-width', 1)
        .attr('clip-path', 'url(#clip)')
        .attr('d', d3.line()
            .x((d) => xScale(d3.timeParse("%Y-%m-%d")(d.Date)))
            .y((d) => yScale(d.Close)));

    // Draw the legend
    for(let i = 0; i < legendProps.length; i++){
        svg.append('g')
            .append('text')
            .attr('transform', `translate(${width - margin.right + 50}, ${margin.top + 10 + 17 * i})`)
            .text(legendProps[i].name)
            .style('font-size', '.8rem')
        svg.append('g')
            .append('line')
            .attr('x1', width - margin.right + 25)
            .attr('y1', margin.top + 5 + 17 * i)
            .attr('x2', width - margin.right + 40)
            .attr('y2', margin.top + 5 + 17 * i)
            .style('stroke', legendProps[i].color);
    }

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', (e) => {
            const newScale = e.transform.rescaleX(xScale);  // Get zoom factor
            xAxis.call(d3.axisBottom(newScale));            // Scale x-axis
            // Redraw line graph
            openPath.attr('d', d3.line()
                .x((d) => newScale(d3.timeParse("%Y-%m-%d")(d.Date)))
                .y((d) => yScale(d.Open))
            );
            lowPath.attr('d', d3.line()
                .x((d) => newScale(d3.timeParse("%Y-%m-%d")(d.Date)))
                .y((d) => yScale(d.Low))
            );
            highPath.attr('d', d3.line()
                .x((d) => newScale(d3.timeParse("%Y-%m-%d")(d.Date)))
                .y((d) => yScale(d.High))
            );
            closePath.attr('d', d3.line()
                .x((d) => newScale(d3.timeParse("%Y-%m-%d")(d.Date)))
                .y((d) => yScale(d.Close))
            );
    });

    svg.call(zoom);
}
