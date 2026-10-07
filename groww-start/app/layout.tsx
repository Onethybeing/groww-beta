import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/app-chrome";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Groww · Start here (concept)",
  description: "A concept demo: Learn → Practice → Invest → Build → Share for first-time investors.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b7a55" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${dmSans.variable} font-sans bg-neutral-100 text-ink antialiased`}>
        <Providers>
          <div className="mx-auto min-h-dvh max-w-[430px] bg-white shadow-sm">
            <AppChrome>{children}</AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}
