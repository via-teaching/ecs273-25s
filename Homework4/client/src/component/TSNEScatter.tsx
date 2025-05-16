import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TSNEData {
  x: number;
  y: number;
  Stock: string;
  [key: string]: any;
}

interface TSNEScatterProps {
  selectedStock: string;
}

const TSNEScatter: React.FC<TSNEScatterProps> = ({ selectedStock }) => {
  const [tsneData, setTsneData] = useState<TSNEData[]>([]);
  const [loading, setLoading] = useState(true);
  const [xDomain, setXDomain] = useState<[number, number]>([0, 1]);
  const [yDomain, setYDomain] = useState<[number, number]>([0, 1]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lastDomain = useRef<{ xDomain: [number, number]; yDomain: [number, number] } | null>(null);

  useEffect(() => {
    const fetchTSNE = async () => {
      try {
        const response = await axios.get<TSNEData[]>("http://localhost:8000/tsne/");
        setTsneData(response.data);
        const xs = response.data.map((p) => p.x);
        const ys = response.data.map((p) => p.y);
        setXDomain([Math.min(...xs), Math.max(...xs)]);
        setYDomain([Math.min(...ys), Math.max(...ys)]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchTSNE();
  }, []);

  const grouped = tsneData.reduce((acc, point) => {
    acc[point.Stock] = acc[point.Stock] || [];
    acc[point.Stock].push(point);
    return acc;
  }, {} as Record<string, TSNEData[]>);

  const getColor = (index: number) => {
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
      "#d0ed57", "#a4de6c", "#d88884", "#c658ff", "#ffa07a"
    ];
    return colors[index % colors.length];
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    const mouseXRatio = offsetX / rect.width;
    const mouseYRatio = offsetY / rect.height;

    const newXMin = xDomain[0] + xRange * (1 - zoomFactor) * mouseXRatio;
    const newXMax = xDomain[1] - xRange * (1 - zoomFactor) * (1 - mouseXRatio);
    const newYMin = yDomain[0] + yRange * (1 - zoomFactor) * (1 - mouseYRatio);
    const newYMax = yDomain[1] - yRange * (1 - zoomFactor) * mouseYRatio;

    setXDomain([newXMin, newXMax]);
    setYDomain([newYMin, newYMax]);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastDomain.current = { xDomain, yDomain };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !lastDomain.current || !containerRef.current) return;
    e.preventDefault();

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const rect = containerRef.current.getBoundingClientRect();
    const xRange = lastDomain.current.xDomain[1] - lastDomain.current.xDomain[0];
    const yRange = lastDomain.current.yDomain[1] - lastDomain.current.yDomain[0];
    const deltaX = (-dx / rect.width) * xRange;
    const deltaY = (dy / rect.height) * yRange;

    setXDomain([
      lastDomain.current.xDomain[0] + deltaX,
      lastDomain.current.xDomain[1] + deltaX,
    ]);
    setYDomain([
      lastDomain.current.yDomain[0] + deltaY,
      lastDomain.current.yDomain[1] + deltaY,
    ]);
  };

  const onMouseUp = () => {
    dragStart.current = null;
    lastDomain.current = null;
  };

  return (
    <div
      className="w-full h-[650px] flex flex-col"
      ref={containerRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      onMouseUp={onMouseUp}
      style={{ userSelect: "none", cursor: dragStart.current ? "grabbing" : "grab" }}
    >
      {loading ? (
        <p>Loading t-SNE data...</p>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="X"
                  domain={xDomain}
                  label={{ value: "t-SNE Dimension 1", position: "bottom", offset: 0 }}
                  tickMargin={10}
                  allowDataOverflow={true}
                  tickFormatter={(val) => val.toFixed(2)}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Y"
                  domain={yDomain}
                  label={{ value: "t-SNE Dimension 2", angle: -90, position: "insideLeft", offset: 10 }}
                  allowDataOverflow={true}
                  tickFormatter={(val) => val.toFixed(2)}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                {Object.entries(grouped).map(([stock, points], idx) => {
                  const isSelected = stock === selectedStock;

                  return (
                    <Scatter
                      key={stock}
                      name={stock}
                      data={points}
                      fill={getColor(idx)}
                      opacity={isSelected ? 1 : 0.2}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        if (!isSelected) {
                          return <circle cx={cx} cy={cy} r={4} fill={getColor(idx)} />;
                        }
                        return (
                          <>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill={getColor(idx)}
                              stroke="black"
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy - 12}
                              textAnchor="middle"
                              fontSize={12}
                              fontWeight="bold"
                              fill="#333"
                            >
                              {stock}
                            </text>
                          </>
                        );
                      }}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {Object.keys(grouped).map((stock, idx) => (
              <div
                key={stock}
                style={{ display: "flex", alignItems: "center", cursor: "default" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    backgroundColor: getColor(idx),
                    marginRight: 8,
                    borderRadius: 3,
                  }}
                />
                {stock}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TSNEScatter;
