import './globals.css';
import { ConfigProvider } from '../utils/ConfigContext';
import { ThemeProvider } from '../utils/ThemeProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ramblog - 简洁高效的备忘录应用",
  description: "一个现代化的备忘录应用，帮助您记录和管理日常想法",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
