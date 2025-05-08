import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';
import Data from "../../data/demo.json";


const margin = { left: 40, right: 20, top: 20, bottom: 60 };
  
export function BarChart() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const bars = Data.data;

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          if (entry.target !== containerRef.current) continue;
          const { width, height } = entry.contentRect;
          if (width && height && !isEmpty(bars)) {
            drawChart(svgRef.current, bars, width, height);
          }
        }
      }, 100)
    );

    resizeObserver.observe(containerRef.current);

    // Draw initially based on starting size
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      drawChart(svgRef.current, bars, width, height);
    }

    return () => resizeObserver.disconnect();
  }, [bars]);

  

  return (
    <div className="chart-container d-flex" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="bar-svg" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
