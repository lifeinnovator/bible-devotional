'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, Heart, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { getMeditationByDate } from '@/app/actions';

export default function CalendarWidget({ meditatedDates }: { meditatedDates: string[] }) {
  // Find the latest date from the records
  const latestDateStr = meditatedDates.length > 0 
    ? meditatedDates.reduce((a, b) => a > b ? a : b) 
    : format(new Date(), 'yyyy-MM-dd');
    
  const initialDate = new Date(latestDateStr);

  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [meditation, setMeditation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const datesSet = useMemo(() => new Set(meditatedDates), [meditatedDates]);

  useEffect(() => {
    const fetchMeditation = async () => {
      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (datesSet.has(dateStr)) {
        const data = await getMeditationByDate(dateStr);
        setMeditation(data);
      } else {
        setMeditation(null);
      }
      setIsLoading(false);
    };
    fetchMeditation();
  }, [selectedDate, datesSet]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-white border border-[#e9e9e7] rounded-2xl p-8 shadow-sm">
      {/* Calendar Section */}
      <div className="w-full md:w-[350px] flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select
              className="text-lg font-bold text-[#37352f] bg-transparent outline-none cursor-pointer hover:bg-[#efefed] rounded p-1"
              value={currentMonth.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(currentMonth);
                newDate.setFullYear(parseInt(e.target.value));
                setCurrentMonth(newDate);
              }}
            >
              {Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => 2015 + i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select
              className="text-lg font-bold text-[#37352f] bg-transparent outline-none cursor-pointer hover:bg-[#efefed] rounded p-1"
              value={currentMonth.getMonth()}
              onChange={(e) => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(parseInt(e.target.value));
                setCurrentMonth(newDate);
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <option key={month} value={month}>{month + 1}월</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
              }} 
              className="px-2.5 py-1 text-xs font-bold text-[#5f5e5b] hover:text-[#37352f] hover:bg-[#efefed] rounded-md border border-[#e9e9e7] bg-[#fbfbfa] transition-colors cursor-pointer"
            >
              오늘
            </button>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-[#efefed] rounded-md transition-colors text-[#9b9a97] hover:text-[#37352f]">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-[#efefed] rounded-md transition-colors text-[#9b9a97] hover:text-[#37352f]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-[#9b9a97]">
          {weekDays.map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasRecord = datesSet.has(dateStr);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all relative
                  ${!isCurrentMonth ? 'text-[#e9e9e7]' : 'text-[#37352f]'}
                  ${isSelected ? 'bg-[#2383e2] text-white font-bold shadow-md' : 'hover:bg-[#efefed]'}
                `}
              >
                <span className="text-sm z-10">{format(day, 'd')}</span>
                {hasRecord && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#2383e2]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Section */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-[#e9e9e7] pt-8 md:pt-0 md:pl-8 flex flex-col">
        <div className="text-sm font-semibold text-[#9b9a97] mb-4 flex items-center gap-2">
          <CalendarIcon size={16} /> {format(selectedDate, 'yyyy년 M월 d일')} 묵상
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[#9b9a97] animate-pulse">
            기록을 불러오는 중입니다...
          </div>
        ) : meditation ? (
          <div className="flex flex-col h-full animate-fade-in-up">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2383e2] bg-[#2383e2]/10 px-2.5 py-1 rounded-md mb-3">
                <BookOpen size={14} /> {meditation.bible_book}
              </div>
              <h3 className="text-2xl font-bold text-[#37352f] leading-tight mb-2">
                {meditation.title || '제목 없음'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {meditation.scripture && (
                <div className="p-5 bg-[#fbfbfa] rounded-2xl border border-[#e9e9e7] text-[#37352f] leading-relaxed text-[14px]">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-[#37352f] mb-3">
                    <BookOpen size={16} className="text-[#37352f]" /> 말씀 구절
                  </div>
                  <div className="whitespace-pre-wrap font-medium">{meditation.scripture}</div>
                </div>
              )}
              
              {meditation.reflection && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-[#37352f]">
                    <Sparkles size={16} className="text-[#37352f]" /> 오늘의 묵상
                  </div>
                  <div className="text-[#37352f] leading-loose text-[16px] whitespace-pre-wrap font-medium">
                    {meditation.reflection}
                  </div>
                </div>
              )}
              
              {meditation.prayer && (
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/30 text-[#2383e2] leading-relaxed text-[15px] italic">
                  <div className="flex items-center gap-2 mb-3 text-[15px] font-bold text-[#2383e2]">
                    <Heart size={16} className="text-[#2383e2] fill-[#2383e2]/10" /> 오늘의 기도
                  </div>
                  {meditation.prayer}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9b9a97] gap-3">
            <BookOpen size={40} className="text-[#e9e9e7]" />
            <p>이 날의 묵상 기록이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
