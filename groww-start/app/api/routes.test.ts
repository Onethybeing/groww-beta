import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as history } from "./history/route";
import { GET as quote } from "./quote/route";

describe("api routes", () => {
  it("history rejects unknown symbols with 400", async () => {
    const res = await history(new NextRequest("http://x/api/history?symbol=EVIL"));
    expect(res.status).toBe(400);
  });
  it("quote rejects empty and unknown lists with 400", async () => {
    expect((await quote(new NextRequest("http://x/api/quote?symbols="))).status).toBe(400);
    expect((await quote(new NextRequest("http://x/api/quote?symbols=TCS.NS,EVIL"))).status).toBe(400);
  });
});
