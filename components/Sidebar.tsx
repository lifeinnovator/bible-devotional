'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, BookOpen, PenLine, BarChart3 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "묵상 달력", href: "/", icon: LayoutDashboard },
    { name: "새 묵상 쓰기", href: "/write", icon: PenLine },
    { name: "성경별 서재", href: "/bookshelf", icon: BookOpen },
    { name: "기록 검색", href: "/search", icon: Search },
    { name: "영적 인사이트", href: "/insights", icon: BarChart3 },
  ];

  return (
    <div className="w-[280px] border-r border-[#e9e9e7] bg-[#fbfbfa] flex flex-col h-screen sticky top-0">
      <div className="p-4 pt-6 flex-1">
        <div className="px-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#37352f] rounded shadow-sm flex items-center justify-center text-white font-bold text-sm">B</div>
            <div className="flex flex-col">
              <span className="font-bold text-[#37352f] text-[14px] leading-tight">장로님의 아침묵상</span>
              <span className="text-[10px] text-[#9b9a97] font-semibold tracking-tight uppercase">Bible Devotional</span>
            </div>
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#efefed] text-[#37352f] font-semibold shadow-sm"
                    : "hover:bg-[#efefed] text-[#787774] hover:text-[#37352f]"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
