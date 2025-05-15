import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 20, top: 20, bottom: 60 };

export function LineChart(stock_name) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    
    
    let path = "";
    if (typeof stock_name === "undefined"){
        path = "http://localhost:8000/stock/AAPL";
    }
    else {
        path = "http://localhost:8000/stock/" + stock_name;
    }
    


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
                    drawChart(svgRef.current, path, width, height);
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
      <svg id="line-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement, path, width, height){
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // clear previous render
    
    d3.json(path).then(data => {
        let transformed_data = [];
        
        for(let i=0;i< data['date'].length;i++){
            // console.log(data.date[i])
            let tmp = {'Date':data.date[i].toString(), "Open":data.Open[i],
                "High":data.High[i],"Low":data.Low[i],"Close":data.Close[i]
            }
            transformed_data.push(tmp)
        }
        return transformed_data}).then(data => {



        let Date = [];
        let Open = [];
        let High = [];
        let Low = [];
        let Close = [];
        
        // change string to number
        data.forEach(d =>{
            
            d.Date = d3.timeParse("%Y-%m-%d")(d.Date.slice(0,10));
            Date.push(d.Date);
            
            d.Open = parseFloat(d.Open);
            Open.push(d.Open);
            
            d.High = parseFloat(d.High);
            High.push(d.High);
            
            d.Low = parseFloat(d.Low);
            Low.push(d.Low);
            
            d.Close = parseFloat(d.Close);
            Close.push(d.Close);
            d.Volume = parseFloat(d.Volume);
        })

        
        // for max and min value
        const big_array = [];
        big_array.push(...Open);
        big_array.push(...High);
        big_array.push(...Low);
        big_array.push(...Close);
        
        const xScale = d3.scaleTime()
            .domain(d3.extent(Date))
            .range([margin.left,width - margin.right]);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(big_array)]) 
            .range([height - margin.bottom, margin.top]); 

       
    
        let xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(10));

        let yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale).ticks(5));

        // y axis text
        svg.append('g')
            .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
            .append('text')
            .text('USD')
            .style('font-size', '.8rem');

        // x axis text
        svg.append('g')
            .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
            .append('text')
            .text('Date')
            .style('font-size', '.8rem');

        // add legend

        // open
        svg.append("circle")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.1})`)
            .attr("r", 3)
            .style("fill", "blue");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.91}, ${height * 0.12})`)
            .text("Open")
            .style("font-size", "10px");

        // high
        svg.append("circle")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.17})`)
            .attr("r", 3)
            .style("fill", "orange");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.91}, ${height * 0.19})`)
            .text("High")
            .style("font-size", "10px");

        // low
        svg.append("circle")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.24})`)
            .attr("r", 3)
            .style("fill", "green");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.91}, ${height * 0.26})`)
            .text("Low")
            .style("font-size", "10px");            

        //close
        svg.append("circle")
            .attr('transform', `translate(${width * 0.90}, ${height * 0.31})`)
            .attr("r", 3)
            .style("fill", "red");
        
        svg.append("text")
            .attr('transform', `translate(${width * 0.91}, ${height * 0.33})`)
            .text("Close")
            .style("font-size", "10px");   

        // 4 lines
        const lineOpen = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.Open));

        const lineHigh = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.High));

        const lineLow = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.Low));

        const lineClose = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.Close));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .attr("d", lineOpen);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1)
            .attr("d", lineHigh);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1)
            .attr("d", lineLow);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("d", lineClose);
        

        

        // zoom
        const zoom = d3.zoom()
            .on("zoom", handleZoom);

        function handleZoom(e) {
            const transform = e.transform
            
            svg.selectAll("g").remove();          
            
            // have to redraw a bug for some reason
            // when it is initally loaded the zoom
            // will leave the original axis
            let xAxis = svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale).ticks(10));

            let yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale).ticks(5));
    
            // y axis text
            svg.append('g')
                .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
                .append('text')
                .text('USD')
                .style('font-size', '.8rem');
    
            // x axis text
            svg.append('g')
                .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top - 5})`)
                .append('text')
                .text('Date')
                .style('font-size', '.8rem');

            const new_scale_x = transform.rescaleX(xScale);

            xAxis.call(d3.axisBottom(new_scale_x).ticks(5));
            
            //remove previously drawn line and redraw it
            svg.selectAll('path').remove();

            // new scale
            lineOpen 
                .x(d => new_scale_x(d.Date))

            lineHigh
                .x(d => new_scale_x(d.Date))

            lineLow 
                .x(d => new_scale_x(d.Date))

            lineClose
                .x(d => new_scale_x(d.Date))
            

            svg.append("clipPath")
                .attr("id", "clipping_line")
                .append("rect")
                .attr("x", margin.left)
                .attr("width", width - 150)
                .attr("height", height);





            // redraw
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", 1)
                .attr("d", lineOpen)
                .attr("clip-path", "url(#clipping_line)");
            
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width", 1)
                .attr("d", lineHigh)
                .attr("clip-path", "url(#clipping_line)");

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 1)
                .attr("d", lineLow)
                .attr("clip-path", "url(#clipping_line)");

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1)
                .attr("d", lineClose)
                .attr("clip-path", "url(#clipping_line)");
            
            }
    
        svg.call(zoom.transform, d3.zoomIdentity);
        svg.call(zoom);
        



        }

    
    
    )}


