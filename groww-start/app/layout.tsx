import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/app-chrome";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "GROW Beta · invest, practise, start small",
  description: "GROW Beta: a concept demo of beginner investing features (learn, practise, start small, build the habit). Not affiliated with Groww. Demo money only.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0b7a55" }, { media: "(prefers-color-scheme: dark)", color: "#08090c" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${dmSans.variable} font-sans bg-page text-ink antialiased`}>
        <Providers>
          <div className="mx-auto min-h-dvh max-w-[430px] bg-card shadow-sm">
            <AppChrome>{children}</AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}
