import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "장로님의 아침묵상 - Bible Devotional Journal",
  description: "장로님의 9년 아침묵상 기록 및 영적 여정",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#fbfbfa] overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto bg-white pb-[60px] md:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
