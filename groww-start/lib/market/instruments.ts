import type { FundCategory } from "@/lib/types";

export interface Instrument {
  symbol: string; name: string; short: string; kind: "stock" | "index" | "etf" | "fund";
  category?: FundCategory; mfCode?: number;
}

const stock = (ticker: string, name: string): Instrument => ({ symbol: `${ticker}.NS`, name, short: ticker, kind: "stock" });
const fund = (code: number, name: string, short: string, category: FundCategory): Instrument =>
  ({ symbol: `MF${code}`, name, short, kind: "fund", category, mfCode: code });

export const INSTRUMENTS: Instrument[] = [
  fund(120716, "UTI Nifty 50 Index Fund", "Nifty 50 Index", "index"),
  fund(122639, "Parag Parikh Flexi Cap Fund", "Flexi Cap", "flexi"),
  fund(118825, "Mirae Asset Large Cap Fund", "Large Cap", "largecap"),
  fund(120503, "Axis ELSS Tax Saver Fund", "ELSS Tax Saver", "elss"),
  fund(119132, "HDFC Gold ETF Fund of Fund", "Gold FoF", "gold"),
  fund(143269, "Parag Parikh Liquid Fund", "Liquid", "liquid"),
  { symbol: "^NSEI", name: "Nifty 50", short: "NIFTY 50", kind: "index" },
  { symbol: "GOLDBEES.NS", name: "Nippon India Gold BeES", short: "GOLDBEES", kind: "etf" },
  stock("RELIANCE", "Reliance Industries"),
  stock("TCS", "Tata Consultancy Services"),
  stock("HDFCBANK", "HDFC Bank"),
  stock("INFY", "Infosys"),
  stock("ITC", "ITC"),
  stock("MARUTI", "Maruti Suzuki"),
  stock("ICICIBANK", "ICICI Bank"),
  stock("SBIN", "State Bank of India"),
  stock("BHARTIARTL", "Bharti Airtel"),
  stock("HINDUNILVR", "Hindustan Unilever"),
  stock("ASIANPAINT", "Asian Paints"),
  stock("TITAN", "Titan Company"),
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((i) => [i.symbol, i]));
export const getInstrument = (symbol: string) => BY_SYMBOL.get(symbol);

export function fundForCategory(cat: FundCategory): Instrument {
  const f = INSTRUMENTS.find((i) => i.kind === "fund" && i.category === cat);
  if (!f) throw new Error(`No fund for category ${cat}`);
  return f;
}

export const snapshotFileName = (symbol: string) => `${symbol.replace(/[^A-Za-z0-9]/g, "_")}.json`;
