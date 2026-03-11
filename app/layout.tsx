import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ohenny | Designer & Creative Thinker",
  description:
    "Portfolio of Oheneba — designer with architecture background, transitioning to digital product design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistPixelSquare.variable}>
      <body style={{ fontFamily: GeistPixelSquare.style.fontFamily }}>
        {children}
      </body>
    </html>
  );
}
