import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tranzo — Crypto Price Feed",
  description: "Real-time crypto prices for 400+ coins. Powered by Binance and CoinGecko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
