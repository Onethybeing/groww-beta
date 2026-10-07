"use client";
import { useEffect, useRef } from "react";
import { createChart, AreaSeries, LineSeries, ColorType, LineStyle } from "lightweight-charts";
import type { SipPoint } from "@/lib/engine/sip";

/** Invested (dashed) vs value (green area) for a SIP replay. */
export function SipChart({ series, height = 170 }: { series: SipPoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || series.length < 2) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#5B5E6E", fontFamily: "DM Sans, sans-serif" },
      grid: { vertLines: { visible: false }, horzLines: { color: "#F1F2F4" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });
    chart.addSeries(AreaSeries, {
      lineColor: "#0B7A55", lineWidth: 2, topColor: "rgba(11,122,85,0.18)", bottomColor: "rgba(11,122,85,0.02)",
      priceLineVisible: false, lastValueVisible: false,
    }).setData(series.map((p) => ({ time: p.date, value: p.value })));
    chart.addSeries(LineSeries, {
      color: "#8A8D9B", lineWidth: 2, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false,
    }).setData(series.map((p) => ({ time: p.date, value: p.invested })));
    chart.timeScale().fitContent();
    const raf = requestAnimationFrame(() => chart.timeScale().fitContent());
    return () => { cancelAnimationFrame(raf); chart.remove(); };
  }, [series]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
