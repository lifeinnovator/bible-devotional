'use client';

import { useState } from 'react';
import { PenLine, Book, Heart, BookOpen } from 'lucide-react';
import { saveMeditation } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function WritePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');          // 말씀 구절명 (예: 시편 150:1-6 (현대인의성경))
  const [scripture, setScripture] = useState('');  // 말씀 본문 (예: 1 여호와를 찬양하라!...)
  const [reflection, setReflection] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !scripture.trim() || !reflection.trim()) {
      setMessage('말씀 구절명, 말씀 본문, 그리고 묵상 내용을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    // Extract bible_book automatically (e.g. from "시편 150:1-6" -> extracts "시편")
    const extractBibleBook = (val: string) => {
      const match = val.trim().match(/^([가-힣\d]+)/);
      return match ? match[1] : '기타';
    };

    const bibleBook = extractBibleBook(title);

    try {
      const res = await saveMeditation({
        date,
        bible_book: bibleBook,
        title: title.trim(),
        scripture: scripture.trim(),
        reflection: reflection.trim(),
        prayer: prayer.trim()
      });

      if (res.success) {
        setMessage('오늘의 묵상이 성공적으로 은혜의 일지에 기록되었습니다! 캘린더 대시보드로 이동합니다...');
        // Clear inputs
        setTitle('');
        setScripture('');
        setReflection('');
        setPrayer('');
        
        // Wait 1.2s then redirect to show the user the new item in calendar instantly
        setTimeout(() => {
          router.push('/');
        }, 1200);
      } else {
        setMessage('저장 중 오류가 발생했습니다: ' + res.error);
      }
    } catch (e) {
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 w-full max-w-[1400px] mx-auto">
      <header className="mb-10 border-b border-[#f2f2f0] pb-6">
        <h1 className="text-3xl font-bold text-[#37352f] flex items-center gap-2 tracking-tight">
          <PenLine size={28} className="text-[#37352f]" /> 새 묵상 쓰기
        </h1>
        <p className="text-[#787774] text-[15px] mt-2">오늘 하루도 하나님의 성호 아래 깊은 은혜를 은총의 일지에 기록해 나갑니다.</p>
      </header>

      <div className="space-y-6 max-w-4xl">
        {/* Date & Scripture Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider">묵상 일자</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2.5 border border-[#e9e9e7] bg-[#fbfbfa] rounded-lg text-sm text-[#37352f] focus:outline-none focus:border-[#2383e2]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider">말씀 (성경 구절명)</label>
            <input
              type="text"
              placeholder="예: 시편 150:1-6 (현대인의성경)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-2.5 border border-[#e9e9e7] bg-[#fbfbfa] rounded-lg text-sm text-[#37352f] focus:outline-none focus:border-[#2383e2] font-semibold"
            />
          </div>
        </div>

        {/* Scripture Text Body Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider flex items-center gap-1">
            <BookOpen size={14} className="text-[#9b9a97]" /> 말씀 본문
          </label>
          <textarea
            placeholder="예: 1 여호와를 찬양하라! 그의 성소에서 하나님을 찬양하라. 그가 능력으로 만드신 하늘에서 그를 찬양하라..."
            rows={5}
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            className="p-4 border border-[#e9e9e7] bg-[#fbfbfa] rounded-lg text-sm text-[#37352f] leading-relaxed focus:outline-none focus:border-[#2383e2] resize-y font-medium"
          />
        </div>

        {/* Reflection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider flex items-center gap-1">
            <Book size={14} className="text-[#9b9a97]" /> 오늘의 말씀 묵상
          </label>
          <textarea
            placeholder="말씀을 묵상하며 깨달은 주님의 사랑과 음성을 이곳에 적어 내려갑니다..."
            rows={8}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="p-4 border border-[#e9e9e7] bg-[#fbfbfa] rounded-lg text-sm text-[#37352f] leading-relaxed focus:outline-none focus:border-[#2383e2] resize-y font-medium"
          />
        </div>

        {/* Prayer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider flex items-center gap-1">
            <Heart size={14} className="text-[#ff5a5f]" /> 오늘의 기도
          </label>
          <textarea
            placeholder="마음 속 깊은 간구와 오늘 하루 믿음으로 살아가기 위한 소망의 기도를 기록합니다..."
            rows={5}
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
            className="p-4 border border-[#e9e9e7] bg-[#fbfbfa] rounded-lg text-sm text-[#37352f] leading-relaxed focus:outline-none focus:border-[#2383e2] resize-y font-medium italic"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm font-semibold animate-fade-in-up ${message.includes('오류') || message.includes('입력') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {message}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 text-right">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#37352f] hover:bg-[#47453f] text-white font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? '은혜의 기록을 보존하는 중...' : '은혜의 일지에 올리기'}
          </button>
        </div>
      </div>
    </div>
  );
}
