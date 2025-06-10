import './globals.css';
import { ConfigProvider } from '../utils/ConfigContext';
import { ThemeProvider } from '../utils/ThemeProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ramblog - 简洁高效的备忘录应用',
  description: '一个现代化的备忘录应用，帮助您记录和管理日常想法',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`antialiased`}>
        <ConfigProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
