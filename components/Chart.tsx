"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode, LineSeries } from "lightweight-charts";
import type { IChartApi, UTCTimestamp } from "lightweight-charts";
import styles from "./Chart.module.css";

interface ChartPoint {
  timestamp: string;
  price_inr: number;
}

interface ChartProps {
  data: ChartPoint[] | null;
  loading: boolean;
  error: boolean;
}

export default function Chart({ data, loading, error }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (loading || error || !data || data.length === 0) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      return;
    }

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#555555",
        fontFamily: "IBM Plex Mono",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        barSpacing: 3,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const series = chart.addSeries(LineSeries, {
      color: "#ffffff",
      lineWidth: 1,
      priceFormat: {
        type: "custom",
        formatter: (price: number) =>
          "₹" + price.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
      },
    });

    const chartData = data.map((d) => ({
      time: Math.floor(new Date(d.timestamp).getTime() / 1000) as UTCTimestamp,
      value: d.price_inr,
    }));

    series.setData(chartData);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, loading, error]);

  if (loading) {
    return (
      <div className={styles.container} ref={containerRef}>
        <div className={styles.overlay}>LOADING HISTORY...</div>
      </div>
    );
  }

  if (error || (!loading && (!data || data.length === 0))) {
    return (
      <div className={styles.container} ref={containerRef}>
        <div className={styles.overlay}>NO DATA</div>
      </div>
    );
  }

  return <div className={styles.container} ref={containerRef} />;
}
