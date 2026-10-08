"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

/** Same footprint as the chart it stands in for, so nothing shifts when the chart arrives. */
export const ChartSkeleton = ({ height }: { height: number }) => <div style={{ height }} className="w-full animate-pulse rounded-xl bg-surface" />;
const Fill = () => <div className="size-full animate-pulse rounded-xl bg-surface" />;

const PriceChartImpl = dynamic(() => import("./price-chart").then((m) => m.PriceChart), { ssr: false, loading: Fill });
const SipChartImpl = dynamic(() => import("./sip-chart").then((m) => m.SipChart), { ssr: false, loading: Fill });

/** Charts load lightweight-charts on demand, keeping it out of the first paint. */
export function PriceChart({ height = 180, ...rest }: ComponentProps<typeof PriceChartImpl>) {
  return <div style={{ height }}><PriceChartImpl height={height} {...rest} /></div>;
}
export function SipChart({ height = 170, ...rest }: ComponentProps<typeof SipChartImpl>) {
  return <div style={{ height }}><SipChartImpl height={height} {...rest} /></div>;
}
