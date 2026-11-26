import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import { BackgroundSquares } from "@/components/BackgroundSquares";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EALPR Vision — Egyptian Car & Motorcycle Plate Intelligence",
  description:
    "Dual-stage AI computer vision for real-time Egyptian car and two-row motorcycle license plate recognition with RTL Arabic OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${cairo.variable} dark`}
    >
      <head>
        {/* Temporary Figma HTML-to-Design capture script */}
        <script
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
          async
        />
      </head>
      <body className="relative font-sans antialiased selection:bg-[#ff4b33]/30 selection:text-white">
        <BackgroundSquares />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
