'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Book, ChevronRight, ChevronLeft, Calendar, Heart, Sparkles } from 'lucide-react';
import { getBooksList, getMeditationsByBook } from '@/app/actions';

interface BookItem {
  name: string;
  count: number;
}

interface MeditationItem {
  date: string;
  bible_book?: string;
  title?: string;
  scripture: string;
  reflection: string;
  prayer: string;
}

export default function BookshelfPage() {
  const [depth, setDepth] = useState<0 | 1 | 2>(0);
  const [oldBooks, setOldBooks] = useState<BookItem[]>([]);
  const [newBooks, setNewBooks] = useState<BookItem[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [meditations, setMeditations] = useState<MeditationItem[]>([]);
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Load books on mount with robust error handling to prevent freeze
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBooksList();
        setOldBooks(data?.oldTestament || []);
        setNewBooks(data?.newTestament || []);
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch meditations when book selected
  const handleBookClick = async (bookName: string) => {
    try {
      setLoading(true);
      setSelectedBook(bookName);
      const data = await getMeditationsByBook(bookName);
      setMeditations(data || []);
      setDepth(1);
    } catch (error) {
      console.error("Error loading meditations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeditationClick = (meditation: MeditationItem) => {
    setSelectedMeditation(meditation);
    setDepth(2);
  };

  // Combine bible_book and title into a perfectly clean, standardized reference label (e.g., "시편 132-134 (현대인의 성경)")
  const getFullReference = (item: MeditationItem, bookName: string) => {
    const cvOnly = getChapterVerse(item, bookName);
    return `${bookName} ${cvOnly}`.trim();
  };

  // Helper to extract clean chapter/verse (e.g. "시편 132-134 (현대인의 성경)" -> "132-134 (현대인의 성경)")
  const getChapterVerse = (item: MeditationItem, bookName: string) => {
    // 1. Clean bible_book field (strip leading Korean letters but keep numbers, hyphens, etc.)
    let bookPart = (item.bible_book || '').trim();
    bookPart = bookPart.replace(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+/g, '').trim();

    // 2. Clean title field (strip leading Korean letters)
    let titlePart = (item.title || '').trim();
    titlePart = titlePart.replace(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+/g, '').trim();

    // 3. Normalize Korean chars '장' and '절' in both parts if they exist
    const normalizeCV = (str: string) => {
      return str
        .replace(/장\s*(\d+)/g, ':$1')
        .replace(/장/g, '')
        .replace(/절/g, '')
        .trim();
    };
    bookPart = normalizeCV(bookPart);
    titlePart = normalizeCV(titlePart);

    // 4. Combine them intelligently without duplication
    if (!bookPart && !titlePart) return '';
    if (!bookPart) return titlePart;
    if (!titlePart) return bookPart;

    // Check if one is contained in the other
    if (titlePart.includes(bookPart)) {
      return titlePart;
    }
    if (bookPart.includes(titlePart)) {
      return bookPart;
    }

    // Otherwise, combine them nicely (e.g. "132-134" + "(현대인의 성경)")
    return `${bookPart} ${titlePart}`.trim();
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 w-full max-w-[1400px] mx-auto">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="text-sm font-semibold text-[#787774] flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#37352f] border-t-transparent rounded-full animate-spin"></div>
            불러오는 중...
          </div>
        </div>
      )}

      {/* Depth 0: Bookshelf Grid */}
      {depth === 0 && (
        <div>
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-[#37352f] flex items-center gap-2 tracking-tight">
              <BookOpen size={28} className="text-[#37352f]" /> 성경별 서재
            </h1>
            <p className="text-[#787774] text-[15px] mt-2 leading-relaxed">
              창세기부터 요한계시록까지, 성경 권별로 분류된 장로님의 은혜로운 영적 서재입니다.
            </p>
          </header>

          {/* Old Testament */}
          {oldBooks.length > 0 && (
            <section className="mb-14">
              <h2 className="text-sm font-bold text-[#9b9a97] uppercase tracking-wider mb-6 border-b border-[#e9e9e7] pb-2">
                구약 성경 (Old Testament)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {oldBooks.map((book, idx) => {
                  const isZero = book.count === 0;
                  return (
                    <div
                      key={idx}
                      onClick={() => !isZero && handleBookClick(book.name)}
                      className={`group p-4 rounded-xl flex items-center justify-between transition-all ${
                        isZero 
                          ? 'bg-[#fbfbfa]/40 border border-[#e9e9e7]/60 opacity-40 cursor-not-allowed select-none' 
                          : 'bg-[#fbfbfa] border border-[#e9e9e7] hover:border-[#2383e2] cursor-pointer hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                          isZero 
                            ? 'bg-transparent border-[#e9e9e7]/40 text-[#9b9a97]/60' 
                            : 'bg-white border-[#e9e9e7] text-[#787774] group-hover:text-[#2383e2]'
                        }`}>
                          <Book size={16} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isZero ? 'text-[#9b9a97]' : 'text-[#37352f]'}`}>{book.name}</div>
                          <div className={`text-[11px] font-semibold ${isZero ? 'text-[#9b9a97]/80' : 'text-[#9b9a97]'}`}>{book.count}개의 묵상</div>
                        </div>
                      </div>
                      {!isZero && <ChevronRight size={14} className="text-[#9b9a97] opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* New Testament */}
          {newBooks.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-[#9b9a97] uppercase tracking-wider mb-6 border-b border-[#e9e9e7] pb-2">
                신약 성경 (New Testament)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {newBooks.map((book, idx) => {
                  const isZero = book.count === 0;
                  return (
                    <div
                      key={idx}
                      onClick={() => !isZero && handleBookClick(book.name)}
                      className={`group p-4 rounded-xl flex items-center justify-between transition-all ${
                        isZero 
                          ? 'bg-[#fbfbfa]/40 border border-[#e9e9e7]/60 opacity-40 cursor-not-allowed select-none' 
                          : 'bg-[#fbfbfa] border border-[#e9e9e7] hover:border-[#2383e2] cursor-pointer hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                          isZero 
                            ? 'bg-transparent border-[#e9e9e7]/40 text-[#9b9a97]/60' 
                            : 'bg-white border-[#e9e9e7] text-[#787774] group-hover:text-[#2383e2]'
                        }`}>
                          <Book size={16} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isZero ? 'text-[#9b9a97]' : 'text-[#37352f]'}`}>{book.name}</div>
                          <div className={`text-[11px] font-semibold ${isZero ? 'text-[#9b9a97]/80' : 'text-[#9b9a97]'}`}>{book.count}개의 묵상</div>
                        </div>
                      </div>
                      {!isZero && <ChevronRight size={14} className="text-[#9b9a97] opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Depth 1: Board-style Meditation List */}
      {depth === 1 && (
        <div>
          <button
            onClick={() => setDepth(0)}
            className="flex items-center gap-1 text-sm font-semibold text-[#787774] hover:text-[#37352f] mb-8 cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} /> 서재로 돌아가기
          </button>

          <header className="mb-10">
            <h1 className="text-3xl font-bold text-[#37352f] flex items-center gap-2.5 tracking-tight">
              <BookOpen size={28} className="text-[#2383e2]" /> {selectedBook} 묵상 기록
            </h1>
            <p className="text-[#787774] text-[15px] mt-2">
              장로님께서 {selectedBook}을 통해 깊이 동행하셨던 {meditations.length}개의 말씀 기록입니다.
            </p>
          </header>

          {/* Bulletin Board Style Table */}
          <div className="border border-[#e9e9e7] bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e9e9e7] bg-[#fbfbfa] text-xs font-bold text-[#9b9a97] uppercase">
                  <th className="py-4 px-6 w-[200px]">묵상일자</th>
                  <th className="py-4 px-6 w-[150px]">성경</th>
                  <th className="py-4 px-6">장 / 절</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f2f0]">
                {meditations.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleMeditationClick(item)}
                    className="hover:bg-[#efefed]/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm text-[#787774] font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-[#9b9a97]" />
                      {item.date}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-[#37352f]">
                      {selectedBook}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#2383e2] font-semibold group-hover:underline">
                      {getChapterVerse(item, selectedBook)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Depth 2: Exact Meditation Calendar Right Panel Layout */}
      {depth === 2 && selectedMeditation && (
        <div>
          <button
            onClick={() => setDepth(1)}
            className="flex items-center gap-1 text-sm font-semibold text-[#787774] hover:text-[#37352f] mb-8 cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} /> 목록으로 돌아가기
          </button>

          <div className="bg-white border border-[#e9e9e7] rounded-3xl p-8 md:p-12 shadow-sm w-full max-w-[1300px] mx-auto flex flex-col animate-fade-in-up">
            <div className="text-sm font-semibold text-[#9b9a97] mb-8 flex items-center gap-2 border-b border-[#f2f2f0] pb-4">
              <Calendar size={16} /> {selectedMeditation.date} 묵상
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Pill & Scripture Box (4 spans out of 12) */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2383e2] bg-[#2383e2]/10 px-2.5 py-1 rounded-md mb-3">
                    <BookOpen size={14} /> {selectedBook}
                  </div>
                  <h3 className="text-2xl font-bold text-[#37352f] leading-tight mt-1">
                    {getFullReference(selectedMeditation, selectedBook)}
                  </h3>
                </div>

                {selectedMeditation.scripture && (
                  <div className="p-5 bg-[#fbfbfa] rounded-2xl border border-[#e9e9e7] text-[#37352f] leading-relaxed text-[14px]">
                    <div className="flex items-center gap-2 text-[15px] font-bold text-[#37352f] mb-3">
                      <BookOpen size={16} className="text-[#37352f]" /> 말씀 구절
                    </div>
                    <div className="whitespace-pre-wrap font-medium">{selectedMeditation.scripture}</div>
                  </div>
                )}
              </div>

              {/* Right Column: Reflection & Prayer (8 spans out of 12) */}
              <div className="lg:col-span-8 space-y-8 lg:border-l lg:border-[#f2f2f0] lg:pl-10">
                {selectedMeditation.reflection && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[15px] font-bold text-[#37352f]">
                      <Sparkles size={16} className="text-[#37352f]" /> 오늘의 묵상
                    </div>
                    <div className="text-[#37352f] leading-loose text-[16px] whitespace-pre-wrap font-medium">
                      {selectedMeditation.reflection}
                    </div>
                  </div>
                )}
                
                {selectedMeditation.prayer && (
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/30 text-[#2383e2] leading-relaxed text-[15px] italic">
                    <div className="flex items-center gap-2 mb-3 text-[15px] font-bold text-[#2383e2]">
                      <Heart size={16} className="text-[#2383e2] fill-[#2383e2]/10" /> 오늘의 기도
                    </div>
                    {selectedMeditation.prayer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
