import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { debounce } from "lodash";

// グラフの余白設定
const margin = { 
  left: 60,   // 左余白
  right: 40,  // 右余白
  top: 50,    // 上余白
  bottom: 50  // 下余白
};

// 株式のカテゴリー分類 -------------
const categories = {
    Energy:       ["XOM", "CVX", "HAL"],
    Industrials:  ["MMM", "CAT", "DAL"],
    Consumer:     ["MCD", "NKE", "KO"],
    Healthcare:   ["JNJ", "PFE", "UNH"],
    Financials:   ["JPM", "GS", "BAC"],
    Tech:         ["AAPL", "MSFT", "NVDA", "GOOGL", "META"]
};

// 銘柄からカテゴリーを素早く検索するためのマップを作成
const categoryMap = {};
Object.entries(categories).forEach(([category, stocks]) => {
    stocks.forEach(symbol => {
        categoryMap[symbol] = category;
    });
});

// カテゴリーごとの色を設定
const colorScale = d3.scaleOrdinal()
  .domain(Object.keys(categories))
  .range(d3.schemeTableau10.slice(0, Object.keys(categories).length));
  
export function ScatterPlot({ selectedStock }) {
  // コンテナとSVGの参照を保持
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dataRef = useRef([]); 

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    // 画面サイズ変更時の処理
    const handleResize = new ResizeObserver(
      debounce((entries) => {
        entries.forEach(entry => {
          if (entry.target === containerRef.current) {
            const { width, height } = entry.contentRect;
            if (width && height) {
              drawPlot(dataRef.current, width, height, selectedStock, svgRef);
            }
          }
        });
      }, 100)
    );

    handleResize.observe(containerRef.current);

    // 初回描画時のデータ取得
    fetch(`http://localhost:8000/api/tsne`)
      .then(response => response.json())
      .then(data => {
        dataRef.current = data;
        const { width, height } = containerRef.current.getBoundingClientRect();
        drawPlot(data, width, height, selectedStock, svgRef);
      })
      .catch(error => {
        console.error('Failed to fetch data:', error);
      });

    return () => handleResize.disconnect();
  }, [selectedStock]);

  return (
    <div className="chart-container" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="scatter-plot" ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

function drawPlot(data, width, height, selectedStock, svgRef) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 前回の描画をクリア
    
    // X軸のスケール設定
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x)).nice()
      .range([margin.left, width - margin.right]);

    // Y軸のスケール設定
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y)).nice()
      .range([height - margin.bottom, margin.top]);
   
    const plotGroup = svg.append("g");

    // クリッピングマスクの設定（プロットエリアからはみ出さないように）
    const clipId = `clip-${Date.now()}`;
    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

    svg.append("g")
      .attr("clip-path", `url(#${clipId})`);

    // 散布図の点を描画
    const points = svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", d => d.ticker === selectedStock ? 7 : 4)  // 選択された銘柄は大きく表示
        .attr("fill", d => colorScale(d.sector))
        .attr("stroke", d => d.ticker === selectedStock ? "#000" : "none")
        .attr("stroke-width", 1);

    // 選択された銘柄のラベルを表示
    plotGroup.selectAll(".stock-label")
      .data(data.filter(d => d.ticker === selectedStock))
      .enter()
      .append("text")
        .attr("class", "stock-label")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "0.7rem")
        .style("font-weight", "700")
        .text(d => d.ticker);

    // X軸の描画
    const xAxis = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom })`)
      .call(d3.axisBottom(xScale));

    // Y軸の描画
    const yAxis = svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // X軸ラベル
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height  - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "0.75rem")
      .text("t-SNE 1");

    // Y軸ラベル
    svg.append("text")
      .attr("x", - height / 2 + margin.top +10 )
      .attr("y", 14)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "0.75rem")
      .text("t-SNE 2");

    // カテゴリー凡例の描画
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${ margin.top  -20})`);

    Object.entries(categories).forEach(([category, _], index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${index * 88},0)`);

      // 凡例の色付き四角形
      legendItem.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(category));

      // 凡例のテキスト
      legendItem.append("text")
        .attr("x", 14)
        .attr("y", 9)
        .style("font-size", "0.65rem")
        .text(category);
    });

    // ズーム機能の実装
    const baseXScale = xScale.copy();
    const baseYScale = yScale.copy();

    // パンの範囲を制限
    const panLimits = [
      [margin.left, margin.top],
      [xScale(d3.max(data, d => d.x)), yScale(d3.min(data, d => d.y))]
    ];

    const zoom = d3.zoom()
      .scaleExtent([1, 10])  // ズームの範囲を1-10倍に制限
      .translateExtent(panLimits)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("zoom", event => {
        const transform = event.transform;
        const newX = transform.rescaleX(baseXScale);
        const newY = transform.rescaleY(baseYScale);

        // 軸の更新
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        // 点とラベルの位置を更新
        points.attr("transform", transform);
        plotGroup.attr("transform", transform);
      });

    svg.call(zoom);
}
