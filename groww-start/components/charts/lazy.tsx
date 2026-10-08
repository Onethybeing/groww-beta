"use client";
import dynamic from "next/dynamic";

const Skeleton = ({ height = 170 }: { height?: number }) => <div style={{ height }} className="w-full animate-pulse rounded-xl bg-surface" />;

/** Charts load lightweight-charts on demand, keeping it out of the first paint. */
export const PriceChart = dynamic(() => import("./price-chart").then((m) => m.PriceChart), { ssr: false, loading: () => <Skeleton /> });
export const SipChart = dynamic(() => import("./sip-chart").then((m) => m.SipChart), { ssr: false, loading: () => <Skeleton /> });
