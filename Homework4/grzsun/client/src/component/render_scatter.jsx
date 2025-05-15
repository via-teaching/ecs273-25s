import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

const path = 'http://localhost:8000/tsne/';
export function ScatterChart(stock_name) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    
    


    useEffect(() => {
        // console.log(containerRef.current)
        // console.log(svgRef.current)
        if (!containerRef.current || !svgRef.current) return;

        const resizeObserver = new ResizeObserver(
        debounce((entries) => {
            for (const entry of entries) {
                if (entry.target !== containerRef.current) continue;
                const { width, height } = entry.contentRect;
                if (width && height && !isEmpty(path)) {
                    //console.log(width)
                    drawChart(svgRef.current, path, width, height, stock_name);
                }
            }
        }, 100)
        );

        resizeObserver.observe(containerRef.current);

        // Draw initially based on starting size
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width && height) {
        drawChart(svgRef.current, path, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [stock_name]);

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="scatter-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement, path, width, height, stock_name){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // clear previous render


    d3.json(path).then(data => {


        const xp = [];
        const yp = [];
        data.forEach(d =>{
            d.x = parseFloat(d.x);
            xp.push(d.x);
            d.y = parseFloat(d.y);
            yp.push(d.y);
        })

        const xScale = d3.scaleLinear()
            .domain([d3.min(xp) - 20,d3.max(xp) + 30])
            .range([margin.left,width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(yp) - 20,d3.max(yp) + 20]) 
            .range([height - margin.bottom, margin.top]); 

        let xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(10));

        let yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale).ticks(5));


        // y axis text
        svg.append('g')
            .attr('transform', `translate(15, ${height / 2}) rotate(-90)`)
            .append('text')
            .text('Tsne axis 2')
            .style('font-size', '.8rem');

        // x axis text
        svg.append('g')
            .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
            .append('text')
            .text('Tsne axis 1')
            .style('font-size', '.8rem');


        // legend
        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.05})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "purple");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.07})`)
            .text("Energy")
            .style("font-size", "10px");

        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.1})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "olive");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.12})`)
            .text("Industry")
            .style("font-size", "10px");

        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.15})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "teal");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.17})`)
            .text("Consumer")
            .style("font-size", "10px");

        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.20})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "coral");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.22})`)
            .text("Health")
            .style("font-size", "10px");

        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.25})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "cyan");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.27})`)
            .text("Finance")
            .style("font-size", "10px");

        svg.append("rect")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.30})`)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "brown");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.915}, ${height * 0.32})`)
            .text("Tech")
            .style("font-size", "10px");

        // draw scatter
        const energy = ["XOM", "CVX", "HAL"];
        const industry = ["MMM", "CAT", "DAL"];
        const consumer = ["MCD","NKE","KO"];
        const health = ["JNJ","PFE", "UNH"];
        const finance = ["JPM","GS","BAC"];
        const tech = ["AAPL","NVDA","MSFT","GOOGL","META"];
        data.forEach(d => {
            let radius = 5;
            if (energy.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "purple")

            }
            if (industry.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "olive")
            }
            if (consumer.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "teal")
            }
            if (health.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "coral")
            }

            if (finance.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "cyan")
            }

            if (tech.includes(d.label)){
                if (d.label === stock_name){radius = 10;}
                svg.append('g')
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", xScale(d.x))
                    .attr("cy", yScale(d.y))
                    .attr("r", radius)
                    .style("fill", "brown")
            }
        })

        // loop to find the selected one and write text
        data.forEach(d => {
            if (d.label === stock_name){
                svg.append("text") 
                    .attr("class", "stock_name") 
                    .attr("x", xScale(d.x))
                    .attr("y", yScale(d.y))
                    .text(stock_name)
                    .style("font-size", "16px")
                    .style("fill", "black");
            }

        })

        // zoom function
        const zoom = d3.zoom()
            .on("zoom", handleZoom);


        function handleZoom(e) {
            // remove stuff
            svg.selectAll("circle").remove();
            svg.selectAll("g").remove()
            svg.select("text.stock_name").remove();

            // redraw axis
            let xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(10));

            let yAxis = svg.append('g')
                .attr('transform', `translate(${margin.left}, 0)`)
                .call(d3.axisLeft(yScale).ticks(5));


            // y axis text
            svg.append('g')
                .attr('transform', `translate(15, ${height / 2}) rotate(-90)`)
                .append('text')
                .text('Tsne axis 2')
                .style('font-size', '.8rem');

            // x axis text
            svg.append('g')
                .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
                .append('text')
                .text('Tsne axis 1')
                .style('font-size', '.8rem');
            
            
            const transform = e.transform;
            
            // rescale factor
            const new_scale_x = transform.rescaleX(xScale);
            const new_scale_y = transform.rescaleY(yScale);
            const new_scale_factor = e.transform.k;

            // rescale
            xAxis.call(d3.axisBottom(new_scale_x).ticks(5));
            yAxis.call(d3.axisLeft(new_scale_y).ticks(5));



            const energy = ["XOM", "CVX", "HAL"];
            const industry = ["MMM", "CAT", "DAL"];
            const consumer = ["MCD","NKE","KO"];
            const health = ["JNJ","PFE", "UNH"];
            const finance = ["JPM","GS","BAC"];
            const tech = ["AAPL","NVDA","MSFT","GOOGL","META"];
            
            // clip the path so no overflow
            svg.append("clipPath")
                .attr("id", "clipping_scatter")
                .append("rect")
                .attr("x", margin.left)
                .attr("y",margin.top)
                .attr("width", width - 150)
                .attr("height", height - margin.bottom - 20);
            
                // redraw
            data.forEach(d => {
                let radius = 5 * new_scale_factor;
                if (energy.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "purple")
    
                }
                if (industry.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "olive")
                }
                if (consumer.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "teal")
                }
                if (health.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "coral")
                }
    
                if (finance.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "cyan")
                }
    
                if (tech.includes(d.label)){
                    if (d.label === stock_name){radius = 10 * new_scale_factor;}
                    svg.append('g')
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", new_scale_x(d.x))
                        .attr("cy", new_scale_y(d.y))
                        .attr("clip-path", "url(#clipping_scatter)")
                        .attr("r", radius)
                        .style("fill", "brown")
                }
            })
            
            // need to add one here to adjust for the lag
            svg.select("text.stock_name").remove();
            data.forEach(d => {
                if (d.label === stock_name){
                    svg.append("text") 
                        .attr("class", "stock_name") 
                        .attr("x", new_scale_x(d.x))
                        .attr("y", new_scale_y(d.y))
                        .text(stock_name)
                        .style("font-size", `${16 * new_scale_factor}px`)
                        .style("fill", "black")
                        .attr("clip-path", "url(#clipping_scatter)");
                }
    
            })

        }
        //svg.selectAll("circle").remove();
        svg.call(zoom.transform, d3.zoomIdentity);
        svg.call(zoom);
    })
}


