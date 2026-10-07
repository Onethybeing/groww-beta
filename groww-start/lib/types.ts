export interface PricePoint { date: string; close: number }
export type DataSource = "live" | "snapshot";
export interface Quote { symbol: string; date: string; price: number; changePct: number; source: DataSource }
export interface HistoryResult { symbol: string; points: PricePoint[]; source: DataSource }
export type FundCategory = "index" | "flexi" | "largecap" | "elss" | "gold" | "liquid";
