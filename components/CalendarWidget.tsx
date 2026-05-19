'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, Heart, Calendar as CalendarIcon, Sparkles, Edit2, Trash2, Check, X } from 'lucide-react';
import { getMeditationByDate, updateMeditation, deleteMeditation } from '@/app/actions';

export default function CalendarWidget({ meditatedDates }: { meditatedDates: string[] }) {
  const [localMeditatedDates, setLocalMeditatedDates] = useState<string[]>(meditatedDates);
  
  useEffect(() => {
    setLocalMeditatedDates(meditatedDates);
  }, [meditatedDates]);

  // Find the latest date from the records
  const latestDateStr = localMeditatedDates.length > 0 
    ? localMeditatedDates.reduce((a, b) => a > b ? a : b) 
    : format(new Date(), 'yyyy-MM-dd');
    
  const initialDate = new Date(latestDateStr);

  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [meditation, setMeditation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBook, setEditBook] = useState('');
  const [editScripture, setEditScripture] = useState('');
  const [editReflection, setEditReflection] = useState('');
  const [editPrayer, setEditPrayer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const datesSet = useMemo(() => new Set(localMeditatedDates), [localMeditatedDates]);

  useEffect(() => {
    setIsEditing(false); // Reset editing mode when selected date changes
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

  const handleStartEdit = () => {
    if (!meditation) return;
    setEditTitle(meditation.title || '');
    setEditBook(meditation.bible_book || '');
    setEditScripture(meditation.scripture || '');
    setEditReflection(meditation.reflection || '');
    setEditPrayer(meditation.prayer || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      alert("말씀 구절 정보(예: 시편 150:1-6)를 입력해주세요.");
      return;
    }
    setIsSaving(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const updated = {
      date: dateStr,
      bible_book: editBook,
      title: editTitle,
      scripture: editScripture,
      reflection: editReflection,
      prayer: editPrayer
    };
    const res = await updateMeditation(updated);
    if (res.success) {
      setMeditation(updated);
      setIsEditing(false);
    } else {
      alert("묵상 수정 중 오류가 발생했습니다: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 날의 묵상 기록을 삭제하시겠습니까?")) return;
    setIsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const res = await deleteMeditation(dateStr);
    if (res.success) {
      setLocalMeditatedDates(prev => prev.filter(d => d !== dateStr));
      setMeditation(null);
    } else {
      alert("묵상 삭제 중 오류가 발생했습니다: " + res.error);
    }
    setIsLoading(false);
  };

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
        <div className="text-sm font-semibold text-[#9b9a97] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} /> {format(selectedDate, 'yyyy년 M월 d일')} 묵상
          </div>
          {meditation && !isEditing && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleStartEdit}
                className="px-2 py-1 text-xs text-[#5f5e5b] hover:text-[#37352f] hover:bg-[#efefed] rounded border border-[#e9e9e7] bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={12} /> 수정
              </button>
              <button 
                onClick={handleDelete}
                className="px-2 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 rounded border border-red-100 bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} /> 삭제
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[#9b9a97] animate-pulse">
            기록을 불러오는 중입니다...
          </div>
        ) : meditation ? (
          isEditing ? (
            <div className="flex flex-col h-full space-y-4 animate-fade-in-up">
              {/* Form Input fields */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#9b9a97]">말씀 구절 정보 (예: 시편 150:1-6 (현대인의성경))</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e9e9e7] rounded-lg text-sm bg-[#fbfbfa] text-[#37352f] font-semibold focus:outline-none focus:border-[#2383e2]"
                  placeholder="예: 시편 150:1-6 (현대인의성경)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#9b9a97]">도서 분류 (성경 책이름, 예: 시편, 창세기)</label>
                <input 
                  type="text"
                  value={editBook}
                  onChange={(e) => setEditBook(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e9e9e7] rounded-lg text-sm bg-[#fbfbfa] text-[#37352f] font-semibold focus:outline-none focus:border-[#2383e2]"
                  placeholder="예: 시편"
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col min-h-[80px]">
                <label className="text-[11px] font-bold text-[#9b9a97]">말씀 본문</label>
                <textarea 
                  value={editScripture}
                  onChange={(e) => setEditScripture(e.target.value)}
                  className="w-full flex-1 px-3 py-2 border border-[#e9e9e7] rounded-lg text-sm bg-[#fbfbfa] text-[#37352f] leading-relaxed focus:outline-none focus:border-[#2383e2] resize-none custom-scrollbar"
                  placeholder="성경 구절 본문을 입력해 주세요."
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col min-h-[120px]">
                <label className="text-[11px] font-bold text-[#9b9a97]">오늘의 묵상</label>
                <textarea 
                  value={editReflection}
                  onChange={(e) => setEditReflection(e.target.value)}
                  className="w-full flex-1 px-3 py-2 border border-[#e9e9e7] rounded-lg text-sm bg-[#fbfbfa] text-[#37352f] leading-relaxed focus:outline-none focus:border-[#2383e2] resize-none custom-scrollbar"
                  placeholder="오늘 깨달은 말씀에 대한 은혜를 작성해 주세요."
                />
              </div>

              <div className="space-y-1 min-h-[80px] flex flex-col">
                <label className="text-[11px] font-bold text-[#9b9a97]">오늘의 기도</label>
                <textarea 
                  value={editPrayer}
                  onChange={(e) => setEditPrayer(e.target.value)}
                  className="w-full flex-1 px-3 py-2 border border-blue-100 rounded-lg text-sm bg-blue-50/20 text-[#2383e2] italic focus:outline-none focus:border-blue-300 resize-none custom-scrollbar"
                  placeholder="주님께 올려드리는 고백과 기도를 작성해 주세요."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#e9e9e7]">
                <button 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#5f5e5b] bg-white border border-[#e9e9e7] rounded-md hover:bg-[#efefed] transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2383e2] hover:bg-[#1b6cb8] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? "저장 중..." : (
                    <>
                      <Check size={14} /> 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
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
          )
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
