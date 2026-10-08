"use client";
import { useEffect, useRef } from "react";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { PricePoint } from "@/lib/types";
import { useResolvedTheme } from "@/lib/store/prefs";
import { chartColors, withAlpha } from "./chart-colors";

export function PriceChart({ points, height = 180 }: { points: PricePoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useResolvedTheme();
  useEffect(() => {
    if (!ref.current || points.length < 2) return;
    const c = chartColors();
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: c.text, fontFamily: "DM Sans, sans-serif" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });
    const up = points[points.length - 1].close >= points[0].close;
    const series = chart.addSeries(AreaSeries, {
      lineColor: up ? c.brand : c.loss,
      lineWidth: 2,
      topColor: withAlpha(up ? c.brand : c.loss, 0.22),
      bottomColor: withAlpha(up ? c.brand : c.loss, 0),
      priceLineVisible: false,
    });
    series.setData(points.map((p) => ({ time: p.date, value: p.close })));
    // autoSize measures the container asynchronously, so fit again once it has a width
    chart.timeScale().fitContent();
    const raf = requestAnimationFrame(() => chart.timeScale().fitContent());
    return () => { cancelAnimationFrame(raf); chart.remove(); };
  }, [points, theme]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
