import type { Metadata } from "next";
import { Inter, Anton, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WHOOP DOWN | Egypt's Premier WHOOP Wearables Store",
  description: "Egypt's Premier WHOOP Wearables Store. Authentic WHOOP 4.0, 5.0 Peak & Life Editions. Physical store: Rich Phone, Serag Mall.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${anton.variable} ${jetbrainsMono.variable} bg-dark-bg text-white antialiased selection:bg-whoop-green selection:text-black min-h-screen`}
      >
        <div className="noise-bg" />
        {children}
      </body>
    </html>
  );
}
