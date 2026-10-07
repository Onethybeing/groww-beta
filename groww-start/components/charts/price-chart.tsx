"use client";
import { useEffect, useRef } from "react";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { PricePoint } from "@/lib/types";

export function PriceChart({ points, height = 180 }: { points: PricePoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || points.length < 2) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#5B5E6E", fontFamily: "DM Sans, sans-serif" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });
    const up = points[points.length - 1].close >= points[0].close;
    const series = chart.addSeries(AreaSeries, {
      lineColor: up ? "#0B7A55" : "#C0392B",
      lineWidth: 2,
      topColor: up ? "rgba(11,122,85,0.22)" : "rgba(192,57,43,0.22)",
      bottomColor: "rgba(255,255,255,0)",
      priceLineVisible: false,
    });
    series.setData(points.map((p) => ({ time: p.date, value: p.close })));
    // autoSize measures the container asynchronously, so fit again once it has a width
    chart.timeScale().fitContent();
    const raf = requestAnimationFrame(() => chart.timeScale().fitContent());
    return () => { cancelAnimationFrame(raf); chart.remove(); };
  }, [points]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
