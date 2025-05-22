import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { isEmpty, debounce } from 'lodash';

// グラフの余白設定
const margin = { 
    left: 40,    // 左余白
    right: 20,   // 右余白
    top: 20,     // 上余白
    bottom: 40   // 下余白
};
  
export function BarChart({ selectedStock }) {
  // コンテナとSVGの参照を保持
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    // 画面サイズ変更時の処理
    const handleResize = new ResizeObserver(
      debounce((entries) => {
        entries.forEach(entry => {
          if (entry.target === containerRef.current) {
            const { width, height } = entry.contentRect;
            if (width && height) {
              // 選択された銘柄の株価データを取得
              fetch(`http://localhost:8000/api/stocks/${selectedStock}/prices`)
                .then(response => response.json())
                .then(data => {
                  drawChart(svgRef.current, data.prices, width, height);
                })
                .catch(error => {
                  console.error('Failed to fetch price data:', error);
                });
            }
          }
        });
      }, 100)
    );

    handleResize.observe(containerRef.current);

    // 初回描画時のデータ取得と描画
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width && height) {
      fetch(`http://localhost:8000/api/stocks/${selectedStock}/prices`)
        .then(response => response.json())
        .then(data => {
          drawChart(svgRef.current, data.prices, width, height);
        })
        .catch(error => {
          console.error('Failed to fetch price data:', error);
        });
    }

    return () => handleResize.disconnect();
  }, [selectedStock]);

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="price-chart" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawChart(svgElement, rawData, width, height) {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // 前回の描画をクリア

    // 株価データの整形
    const data = rawData.map((d) => ({
        date: new Date(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
    }));

    // Y軸の範囲を計算（株価の最高値と最安値）
    const priceRange = d3.extent(
        data.flatMap(d => [d.open, d.high, d.low, d.close])
    );

    // X軸（日付）のスケール設定
    const timeScale = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.date));

    // Y軸（株価）のスケール設定
    const priceScale = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain(priceRange);
    
    const chartGroup = svg.append("g");

    // Y軸の描画
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(priceScale));

    // Y軸ラベル
    svg.append('g')
        .attr('transform', `translate(10, ${height / 2}) rotate(-90)`)
        .append('text')
        .text('Price')
        .style('font-size', '.8rem');

    // X軸ラベル
    svg.append('g')
        .attr('transform', `translate(${width / 2 - margin.left}, ${height - margin.top +12 })`)
        .append('text')
        .text('Date')
        .style('font-size', '.8rem'); 

    // 株価の種類と色の定義
    const priceTypes = [
        { key: "open", label: "Open", color: "blue" },
        { key: "high", label: "High", color: "green" },
        { key: "low", label: "Low", color: "orange" },
        { key: "close", label: "Close", color: "red" },
    ];
    
    // 各株価種別のラインを描画
    priceTypes.forEach(({ key, color }, index) => {
        const priceLine = d3.line()
            .x((d) => timeScale(d.date))
            .y((d) => priceScale(d[key]));
    
        chartGroup.append("path")
            .datum(data)
            .attr("class", `price-line-${index}`) 
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("d", priceLine);
    });

    // 凡例の描画
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 5 }, ${height - margin.bottom - 20})`);

    priceTypes.forEach(({ label, color }, index) => {
        const legendGroup = legend.append("g")
            .attr("transform", `translate(${index * 50},0)`);

        // 凡例の色付き四角形
        legendGroup.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color);

        // 凡例のテキスト
        legendGroup.append("text")
            .attr("x", 16)
            .attr("y", 10)
            .style("font-size", "0.65rem")
            .attr("fill", color) 
            .text(label);
    });

    // 操作説明のテキスト
    svg.append("text")
        .attr("class", "hint")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom + 30)
        .style("text-anchor", "end")
        .style("font-size", "0.75rem")
        .style("fill", "#666")
        .text("drag: scroll, wheel/pinch: zoom");

    // クリッピングマスクの設定（グラフエリアからはみ出さないように）
    const clipId = "clip-" + Date.now();
    svg.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

    chartGroup.attr("clip-path", `url(#${clipId})`);

    // X軸の描画
    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(timeScale));

    // ズーム機能の実装
    const baseTimeScale = timeScale.copy();

    const zoom = d3.zoom()
        .scaleExtent([1, 20])  // ズームの範囲を1-20倍に制限
        .extent([[margin.left, 0], [width - margin.right, 0]])
        .on("zoom", handleZoom);

    svg.call(zoom);

    // ズーム時の処理
    function handleZoom(event) {
        const newTimeScale = event.transform.rescaleX(baseTimeScale);
        xAxis.call(d3.axisBottom(newTimeScale));

        // 各株価ラインの位置を更新
        priceTypes.forEach(({ key }, index) => {
            const updatedLine = d3.line()
                .x(d => newTimeScale(d.date))
                .y(d => priceScale(d[key]));

            svg.select(`.price-line-${index}`)
                .attr("d", updatedLine);
        });
    }
}

