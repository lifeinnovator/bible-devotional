'use client';

import { useState } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  // Sample static results for a premium mockup feel
  const sampleResults = [
    { date: '2024-05-10', book: '시편 23편', title: '부족함이 전혀 없는 풍요로운 사랑', excerpt: '여호와께서 내 목자가 되시기에 나에게는 그 어떤 결핍도 고통도 장애물이 되지 않는다...' },
    { date: '2024-04-18', book: '마태복음 6장', title: '염려를 넘어 주님의 나라로', excerpt: '오늘 들풀도 입히시는 그 온전한 은혜를 보며 나의 작은 염려들을 주님의 십자가 아래 내려놓는다...' },
    { date: '2023-11-25', book: '로마서 8장', title: '어떤 피조물도 끊을 수 없는 주님의 사랑', excerpt: '사망이나 생명이나 높음이나 깊음도 그리스도 예수 안에 있는 하나님의 사랑에서 나를 결코...' }
  ];

  return (
    <div className="p-10 md:p-14 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#37352f] flex items-center gap-2 tracking-tight">
          <Search size={28} className="text-[#37352f]" /> 기록 검색
        </h1>
        <p className="text-[#787774] text-sm mt-2">장로님이 기록해 오신 9년의 아침 흔적들을 단어나 본문으로 조용히 꺼내 봅니다.</p>
      </header>

      {/* Large Input Box */}
      <div className="relative mb-12">
        <input
          type="text"
          placeholder="성경 권, 제목, 혹은 본문 내용의 키워드를 입력해 보세요... (예: 시편, 은혜)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-[#e9e9e7] bg-[#fbfbfa] rounded-xl text-[15px] text-[#37352f] focus:outline-none focus:border-[#2383e2] shadow-sm transition-all placeholder-[#9b9a97]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9a97]" size={20} />
      </div>

      {/* Suggested Search Keywords */}
      <div className="mb-12">
        <div className="text-xs font-bold text-[#9b9a97] uppercase mb-3">자주 검색한 말씀 구절</div>
        <div className="flex flex-wrap gap-2">
          {['시편 23편', '감사', '평안', '고난', '로마서', '잠언'].map(kw => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className="px-3.5 py-1.5 bg-[#f2f2f0] hover:bg-[#efefed] text-[#37352f] text-xs font-medium rounded-full transition-colors cursor-pointer"
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Mockup */}
      <div className="space-y-6">
        <div className="text-xs font-bold text-[#9b9a97] uppercase border-b border-[#e9e9e7] pb-2">
          {query ? `'${query}' 검색 결과 (예시)` : '최근 기록된 묵상 서재 목록'}
        </div>
        
        <div className="divide-y divide-[#f2f2f0]">
          {sampleResults.map((item, idx) => (
            <div key={idx} className="py-5 first:pt-0 last:pb-0 group cursor-pointer flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 text-xs text-[#9b9a97] mb-2">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                  <span className="font-semibold px-2 py-0.5 bg-[#efefed] text-[#37352f] rounded">{item.book}</span>
                </div>
                <h3 className="text-base font-bold text-[#37352f] group-hover:text-[#2383e2] transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#787774] leading-relaxed line-clamp-2 pr-8">{item.excerpt}</p>
              </div>
              <ChevronRight size={18} className="text-[#9b9a97] self-center group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
