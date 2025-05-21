import { useEffect, useRef } from "react";
import * as d3 from "d3";

type TSNERecord = {
  Symbol: string;
  Sector: string;
  X: number;
  Y: number;
};

type ApiTSNERecord = {
  _id: string;
  Symbol: string;
  Sector: string;
  X: number;
  Y: number;
};

type TSNEScatterProps = {
  selectedSymbol: string;
};

export default function TSNEScatter({ selectedSymbol }: TSNEScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:8000/tsne");
        const raw: ApiTSNERecord[] = await response.json();
        const data: TSNERecord[] = raw.map(({ _id, ...rest }) => ({
          ...rest,
          X: +rest.X,
          Y: +rest.Y,
        }));
        draw(data);
      } catch (error) {
        console.error("Failed to load t-SNE data from API:", error);
      }
    };

    loadData();
  }, [selectedSymbol]);

  const draw = (data: TSNERecord[]) => {
    const container = containerRef.current!;
    const svg = d3.select(svgRef.current!);
    svg.selectAll("*").remove();

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 30, bottom: 100, left: 50 };

    const xExtent = d3.extent(data, d => d.X) as [number, number];
    const yExtent = d3.extent(data, d => d.Y) as [number, number];

    let xScale = d3.scaleLinear()
      .domain([xExtent[0] - 5, xExtent[1] + 5])
      .range([margin.left, width - margin.right]);

    let yScale = d3.scaleLinear()
      .domain([yExtent[0] - 5, yExtent[1] + 5])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain([...new Set(data.map(d => d.Sector))])
      .range(d3.schemeTableau10);

    const g = svg.append("g").attr("class", "plot-group");

    const gx = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    const gy = g.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    const tooltip = d3.select(container)
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("fontSize", "0.8rem")
      .style("pointerEvents", "none")
      .style("visibility", "hidden");

    const drawDots = (
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
    ) => {
      g.selectAll("circle").remove();
      g.selectAll("text.symbol-label").remove();

      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.X))
        .attr("cy", d => y(d.Y))
        .attr("r", d => d.Symbol === selectedSymbol ? 8 : 4)
        .attr("fill", d => colorScale(d.Sector) as string)
        .attr("stroke", d => d.Symbol === selectedSymbol ? "black" : "none")
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).style("cursor", "pointer");
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.Symbol}</strong><br/>Sector: ${d.Sector}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.offsetY + 10}px`)
            .style("left", `${event.offsetX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

      g.selectAll("text.symbol-label")
        .data(data.filter(d => d.Symbol === selectedSymbol))
        .enter()
        .append("text")
        .attr("x", d => x(d.X) + 10)
        .attr("y", d => y(d.Y))
        .attr("class", "symbol-label")
        .text(d => d.Symbol)
        .style("font-size", "0.8rem")
        .style("font-weight", "bold");
    };

    drawDots(xScale, yScale);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        const transform = event.transform;
        const zx = transform.rescaleX(xScale);
        const zy = transform.rescaleY(yScale);
        gx.call(d3.axisBottom(zx));
        gy.call(d3.axisLeft(zy));
        drawDots(zx, zy);
      });

    svg.call(zoom);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "1rem")
      .style("font-weight", "bold")
      .text("t-SNE Projection of Stock Latent Features");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 55)
      .attr("text-anchor", "middle")
      .style("font-size", "0.9rem")
      .text("t-SNE Dimension 1");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "0.9rem")
      .text("t-SNE Dimension 2");

    const legend = g.selectAll(".legend")
      .data(colorScale.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (_, i) => `translate(-10, ${margin.top + 100 + i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", d => colorScale(d) as string);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}
