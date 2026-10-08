"use client";
import { useEffect, useRef } from "react";
import { createChart, AreaSeries, LineSeries, ColorType, LineStyle } from "lightweight-charts";
import type { SipPoint } from "@/lib/engine/sip";
import { useResolvedTheme } from "@/lib/store/prefs";
import { chartColors, withAlpha } from "./chart-colors";

/** Invested (dashed) vs value (green area) for a SIP replay. */
export function SipChart({ series, height = 170 }: { series: SipPoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useResolvedTheme();
  useEffect(() => {
    if (!ref.current || series.length < 2) return;
    const c = chartColors();
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: c.text, fontFamily: "DM Sans, sans-serif" },
      grid: { vertLines: { visible: false }, horzLines: { color: c.grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });
    chart.addSeries(AreaSeries, {
      lineColor: c.brand, lineWidth: 2, topColor: withAlpha(c.brand, 0.18), bottomColor: withAlpha(c.brand, 0.02),
      priceLineVisible: false, lastValueVisible: false,
    }).setData(series.map((p) => ({ time: p.date, value: p.value })));
    chart.addSeries(LineSeries, {
      color: c.faint, lineWidth: 2, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false,
    }).setData(series.map((p) => ({ time: p.date, value: p.invested })));
    chart.timeScale().fitContent();
    const raf = requestAnimationFrame(() => chart.timeScale().fitContent());
    return () => { cancelAnimationFrame(raf); chart.remove(); };
  }, [series, theme]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
