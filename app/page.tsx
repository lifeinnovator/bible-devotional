import { turso } from "@/lib/turso";
import { LayoutDashboard, Search, BookOpen, PenLine, Heart } from "lucide-react";
import CalendarWidget from "@/components/CalendarWidget";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [countResult, allDatesResult] = await Promise.all([
    turso.execute("SELECT COUNT(*) as count FROM meditations"),
    turso.execute("SELECT date FROM meditations"),
  ]);

  const totalDays = countResult.rows[0].count as number;
  const allDates = allDatesResult.rows.map(r => r.date as string);


  return (
    <div className="p-6 md:p-12 lg:p-16 w-full max-w-[1400px] mx-auto">
      <div>
        <header className="mb-6 animate-fade-in">
          <div className="bg-[#fbfbfa] border border-[#e9e9e7] rounded-xl p-4 md:p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2383e2]" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2.5">
              <blockquote className="text-base md:text-[17px] font-bold text-[#37352f] italic">
                “여호와를 경외하는 것이 지혜의 근본이요 거룩하신 자를 아는 것이 명철이니라”
              </blockquote>
              <span className="text-[13px] font-semibold text-[#9b9a97] shrink-0">— 잠언 9:10</span>
            </div>
            <p className="text-[#787774] text-[13px] leading-relaxed pt-2.5 border-t border-[#e9e9e7]/60">
              지금까지 기록된 <strong className="text-[#37352f] font-semibold">{totalDays.toLocaleString()}일</strong>의 아침은 장로님께서 하나님과 독대한 거룩한 여정의 흔적입니다.
            </p>
          </div>
        </header>



          <section className="mb-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#37352f]">
              일별 묵상 기록
            </h2>
            <CalendarWidget meditatedDates={allDates} />
          </section>

          <section className="mb-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#37352f]">
              <Heart size={20} className="text-[#ff5a5f]" /> 영적 여정 분석 요약
            </h2>
            <div className="bg-[#fbfbfa] border border-[#e9e9e7] rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#37352f] mb-4">"고난 속에서도 피어난 깊은 감사의 고백"</h3>
              <p className="text-[#37352f] leading-relaxed mb-6 text-[15.5px]">
                장로님께서 지난 9년간 기록하신 2,590편의 묵상 데이터를 텍스트 분석한 결과, 가장 많이 등장한 핵심 키워드는 <strong>'은혜'</strong>, <strong>'감사'</strong>, <strong>'소망'</strong>, 그리고 <strong>'회복'</strong>입니다. 
                초기 기록에서는 성경 본문에 대한 객관적인 깨달음과 적용이 주를 이루었다면, 시간이 흐를수록 삶의 구체적인 고난과 이웃을 향한 중보 기도의 비중이 눈에 띄게 깊어지는 영적 흐름을 보여줍니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-xl border border-[#e9e9e7]">
                  <div className="text-xs font-bold text-[#9b9a97] mb-2">주요 묵상 패턴</div>
                  <ul className="list-disc list-inside text-sm text-[#37352f] space-y-1">
                    <li>시편을 통한 하나님과의 치열하고도 친밀한 독대</li>
                    <li>고난과 시련을 '연단'으로 해석하는 굳건한 신앙관</li>
                    <li>가정과 교회를 넘어 열방을 품는 기도의 지경 확장</li>
                  </ul>
                </div>
                <div className="p-5 bg-white rounded-xl border border-[#e9e9e7]">
                  <div className="text-xs font-bold text-[#9b9a97] mb-2">영적 성장의 흐름</div>
                  <ul className="list-disc list-inside text-sm text-[#37352f] space-y-1">
                    <li><span className="font-semibold text-[#2383e2]">전반기:</span> 개인의 경건과 진리 탐구에 집중</li>
                    <li><span className="font-semibold text-[#2383e2]">중반기:</span> 고난 속에서의 하나님의 주권 인정</li>
                    <li><span className="font-semibold text-[#2383e2]">후반기:</span> 다음 세대와 이웃을 향한 섬김과 헌신</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 text-right">
                <Link href="/insights" className="text-sm font-semibold text-[#2383e2] hover:underline cursor-pointer">
                  + 상세 분석 리포트 전체 보기
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
}


