'use client';

import { useState } from 'react';
import { Sparkles, Calendar, BookOpen, Heart, TrendingUp, Compass, Award, Scroll } from 'lucide-react';

interface YearlyInsight {
  year: string;
  slogan: string;
  theme: string;
  scriptures: string[];
  words: string[];
  tone: {
    petition: number;  // 간구
    tuning: number;    // 조율
    trust: number;     // 위탁
  };
  description: string;
}

const yearlyInsightsData: YearlyInsight[] = [
  {
    year: "2017년",
    slogan: "말씀의 깊은 심연 속으로 첫 발을 내딛다",
    theme: "교리적 토대 마련 및 아침묵상 습관화",
    scriptures: ["로마서", "갈라디아서", "창세기"],
    words: ["죄인", "심판", "진리", "경건"],
    tone: { petition: 70, tuning: 20, trust: 10 },
    description: "아침묵상의 초석을 놓는 해로, 성경 말씀의 객관적인 교리와 진리 기준을 수립하는 데 주안점을 두었습니다. 자신의 한계와 부조리를 직면하는 성찰이 많았으며, 기도의 형태는 주로 약함을 도우시는 하나님께 직접적으로 매달리는 간구(Petitional)의 양상이 지배적이었습니다."
  },
  {
    year: "2018년",
    slogan: "순종과 자기 성찰의 묵상 연단",
    theme: "고난의 극복과 굳건한 신앙 훈련",
    scriptures: ["욥기", "시편", "욥기"],
    words: ["순종", "연단", "고난", "인내"],
    tone: { petition: 60, tuning: 30, trust: 10 },
    description: "삶의 여러 현실적 시련과 고난의 의미를 하나님의 섭리 안에서 재해석하는 해였습니다. 욥의 고난과 시편 기자의 탄식을 묵상하며 신앙의 단련과 성실한 경건 훈련에 힘썼습니다. 점차 단순한 간구를 넘어 하나님의 뜻과 자신의 행동을 일치시키려는 조율(Tuning)이 시작되었습니다."
  },
  {
    year: "2019년",
    slogan: "하나님의 절대 주권 아래 거하기",
    theme: "구속사의 시각에서 바라보는 일상",
    scriptures: ["사무엘상하", "열왕기상하", "역대기"],
    words: ["주권", "섭리", "겸손", "예배"],
    tone: { petition: 50, tuning: 40, trust: 10 },
    description: "이스라엘의 역사서들을 종단하며 역사를 경영하시고 일상에 간섭하시는 여호와의 절대적 주권을 깊이 확인한 한 해였습니다. 내 뜻대로 되지 않는 현실 속에서도 하나님의 주권을 인정하고, 예배의 회복과 겸손을 구하는 묵상 패턴이 뚜렷해졌습니다."
  },
  {
    year: "2020년",
    slogan: "관계의 친밀함과 깊은 은혜의 고백",
    theme: "율법의 엄격함을 넘어선 하나님의 다정한 성품 고백",
    scriptures: ["마태복음", "마가복음", "누가복음"],
    words: ["은혜", "아버지", "재롱", "긍휼"],
    tone: { petition: 40, tuning: 40, trust: 20 },
    description: "신약의 복음서들을 깊이 묵상하며 성육신하신 예수 그리스도의 인자함과 긍휼을 인격적으로 대면했습니다. 엄격한 주권자 하나님을 넘어, 상한 갈대를 꺾지 않으시는 친밀한 '아버지'로 고백하는 빈도가 급증했으며, 어린아이와 같이 하나님 앞에 '재롱'을 피우듯 고백하는 아름답고 따뜻한 표현들이 다수 나타납니다."
  },
  {
    year: "2021년",
    slogan: "치유와 안식을 주시는 참 선한 목자",
    theme: "코로나 팬데믹기 속에 평강 찾기",
    scriptures: ["요한복음", "시편", "히브리서"],
    words: ["목자", "안식", "사랑", "치유"],
    tone: { petition: 30, tuning: 50, trust: 20 },
    description: "전 세계적인 혼란과 팬데믹 상황 속에서, 영혼을 소생시키시고 푸른 초장으로 인도하시는 '참 선한 목자'로서의 하나님을 붙들었습니다. 두려움과 염려를 내어놓고 고요하게 영적 안식을 얻는 묵상이 많았으며, 기도는 끊임없이 내 마음의 고주파를 주님의 고요에 공명시키는 깊은 조율의 단계로 발전했습니다."
  },
  {
    year: "2022년",
    slogan: "삶의 치열한 현장에서 꽃피우는 일터 영성",
    theme: "예배로서의 일상과 삶의 통전성",
    scriptures: ["에베소서", "빌립보서", "골로새서"],
    words: ["일터", "영성", "동행", "일치"],
    tone: { petition: 20, tuning: 50, trust: 30 },
    description: "바울 서신들의 원리를 현실 일터와 구체적인 사역 현장에 이식한 해입니다. 교회 내부의 예배에 갇히지 않고, 월요일부터 토요일까지의 세속 일상을 거룩한 예배의 처소로 삼는 '일터 영성'과 주님과의 동행이 핵심 의제였으며, 기도는 주님의 주권에 나를 전적으로 매칭하는 위탁의 비중이 늘어났습니다."
  },
  {
    year: "2023년",
    slogan: "공동체와 열방을 향한 영적 중보자",
    theme: "나를 넘어 이웃과 세계를 품는 사명",
    scriptures: ["이사야", "예레미야", "에스겔"],
    words: ["중보", "열방", "눈물", "사명"],
    tone: { petition: 20, tuning: 40, trust: 40 },
    description: "구약 선지자들의 상한 마음과 눈물을 체휼하며, 개인의 안위나 간구를 뛰어넘어 가정, 교회, 그리고 상처받은 열방과 사회 공동체를 품는 중보 기도가 묵상의 주류를 이루었습니다. 나의 무력함을 깨닫고 오직 하나님의 약속만을 온전히 의지하며 맡기는 신뢰가 절정에 달했습니다."
  },
  {
    year: "2024년",
    slogan: "자아의 비움과 눈부신 영적 수동성",
    theme: "내가 죽고 예수로 사는 절대 순종",
    scriptures: ["요한일서", "요한이서", "베드로전서"],
    words: ["수동성", "비움", "맡김", "평강"],
    tone: { petition: 10, tuning: 30, trust: 60 },
    description: "자아를 철저히 비워내고 오직 성령께서 내 안에서 운행하시도록 내어드리는 '영적 수동성(Spiritual Passivity)'이 묵상의 지배적인 원리로 확립된 위대한 해입니다. 내가 하려는 모든 의지적 힘을 빼고 주님의 완전한 통치에 전적으로 안착함으로써, 어떠한 환경 풍파 속에서도 흔들리지 않는 천상의 평강을 온전히 누리게 되었습니다."
  },
  {
    year: "2025년",
    slogan: "선한 싸움을 싸우고 온전한 평안에 안착하다",
    theme: "종말론적 영적 안식과 영원한 소망",
    scriptures: ["요한계시록", "디모데후서", "베드로후서"],
    words: ["평강", "영광", "소망", "승리"],
    tone: { petition: 10, tuning: 20, trust: 70 },
    description: "신앙 여정의 완성을 바라보는 영원한 소망과 영광의 해입니다. 이 땅의 나그네 여정 속에서 이미 승리하신 그리스도의 영광을 묵상하고, 선한 싸움을 마친 후 주어질 하늘의 안식을 갈망합니다. 기도의 70% 이상이 오직 하나님의 선하심에 삶과 미래를 온전히 위탁(Trust)하는 초연한 신뢰로 채워졌습니다."
  },
  {
    year: "2026년",
    slogan: "텍스트(Text)를 삶의 콘텍스트(Context)로 번역하는 순종",
    theme: "말씀의 창조적 질서 회복과 일상적 나그네 대접",
    scriptures: ["창세기", "마태복음", "야고보서"],
    words: ["텍스트", "콘텍스트", "순종", "질서"],
    tone: { petition: 10, tuning: 15, trust: 75 },
    description: "오랜 시간 쌓아온 영적 수동성의 결실이 구체적인 삶의 환경(콘텍스트) 속에서 하나님의 텍스트(말씀)로 실천되는 해입니다. 창조의 질서와 에덴의 타락을 깊이 묵상하며, 스스로의 힘으로 높이 쌓으려는 바벨탑 문화에 휩쓸리지 않고, 허물을 덮어주고 나그네를 종의 자세로 대접하는 일상적 순종에 천착합니다. 아는 지식에 머물지 않고 일상의 한 조각조차 거룩한 예배가 되도록 삶을 주님께 전적으로 위탁합니다."
  }
];

export default function InsightsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026년");

  const currentInsight = yearlyInsightsData.find(item => item.year === selectedYear) || yearlyInsightsData[yearlyInsightsData.length - 1];

  return (
    <div className="p-6 md:p-12 lg:p-16 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-12 border-b border-[#f2f2f0] pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#2383e2]/10 text-[#2383e2] rounded-xl">
            <Compass size={28} />
          </div>
          <h1 className="text-3xl font-bold text-[#37352f] tracking-tight">영적 인사이트 리포트</h1>
        </div>
        <p className="text-[#787774] text-[17px] leading-relaxed max-w-4xl">
          장로님께서 오랜 세월 매일 새벽마다 쌓아 올리신 수천 편의 묵상 본문과 기도의 언어 속에서, 
          하나님의 신실하신 인도하심과 은혜의 흔적을 연대기적/영적 성장 궤적으로 분석한 심층 통찰 리포트입니다.
        </p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Era Trajectory (5 spans out of 12) */}
        <div className="xl:col-span-5 space-y-8">
          <div className="bg-white border border-[#e9e9e7] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#37352f] mb-6 flex items-center gap-2 border-b border-[#f2f2f0] pb-3">
              <TrendingUp size={20} className="text-[#2383e2]" /> 4단계 영적 성장 궤적
            </h2>
            
            <div className="relative border-l-2 border-[#f2f2f0] ml-3 pl-6 space-y-8">
              {/* Stage 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#f2f2f0] text-[10px] font-bold text-[#9b9a97]">1</span>
                <div>
                  <span className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider block">2017 ~ 2019</span>
                  <h3 className="text-[15px] font-bold text-[#37352f] mt-1">기초기: 말씀의 뿌리를 내림</h3>
                  <p className="text-sm text-[#787774] mt-1.5 leading-relaxed">
                    율법과 교리 말씀의 엄중한 기준을 확립하고, 매일의 정갈한 성찰적 아침 기도를 일상 습관으로 단단히 다지는 훈련의 계절입니다.
                  </p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#2383e2]/10 text-[10px] font-bold text-[#2383e2]">2</span>
                <div>
                  <span className="text-xs font-bold text-[#2383e2] uppercase tracking-wider block">2020 ~ 2021</span>
                  <h3 className="text-[15px] font-bold text-[#37352f] mt-1">관계기: 긍휼과 친밀한 안식</h3>
                  <p className="text-sm text-[#787774] mt-1.5 leading-relaxed">
                    엄격한 주권자를 넘어, 내게 은혜를 속삭이시는 다정한 친정 아버지와 같은 친밀감을 누리며 깊은 영적 쉼을 맛본 계절입니다.
                  </p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600">3</span>
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">2022 ~ 2023</span>
                  <h3 className="text-[15px] font-bold text-[#37352f] mt-1">현장기: 삶의 중보와 일터 영성</h3>
                  <p className="text-sm text-[#787774] mt-1.5 leading-relaxed">
                    세속의 치열한 월요일 속에서도 주님과 밀착 동행하며, 개인을 넘어 이웃과 세상을 눈물로 중보하는 성령의 일하심을 체휼한 계절입니다.
                  </p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-purple-50 text-[10px] font-bold text-purple-600 animate-pulse">4</span>
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">2024 ~ 2026+</span>
                  <h3 className="text-[15px] font-bold text-[#37352f] mt-1">수동성기: 자기 비움과 절대 평강</h3>
                  <p className="text-sm text-[#787774] mt-1.5 leading-relaxed">
                    자신의 힘을 모두 비워 온전히 내맡김으로써 주님의 평강에 완전히 안착하는 **영적 수동성(Spiritual Passivity)**의 절정을 고백하는 복된 계절입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Word Evolution Insight Card */}
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 border border-blue-100/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#37352f] mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[#2383e2]" /> 어휘로 보는 영적 패러다임의 시프트
            </h2>
            <p className="text-sm text-[#37352f] leading-relaxed mb-4">
              9년 전의 묵상과 최근 묵상의 가장 핵심적인 어휘적 차이는 **'내 의지'**에서 **'오직 은혜'**로의 이행입니다. 
              초기의 성찰이 스스로의 결점을 참회하고 극복하려는 적극적 자기 통제가 중심이었다면, 
              후기 묵상으로 갈수록 자아를 죽이고 주님의 주권 속에 완전히 순종하는 흐름을 보여줍니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#f2f2f0] text-[#787774] line-through">적극적인 의지</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#f2f2f0] text-[#787774] line-through">자아의 다스림</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100/50 text-[#2383e2] font-bold">오직 은혜</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100/50 text-purple-600 font-bold">영적 수동성</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Yearly Analysis (7 spans out of 12) */}
        <div className="xl:col-span-7 space-y-8">
          <div className="bg-white border border-[#e9e9e7] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#f2f2f0] pb-4 mb-6 gap-4">
              <h2 className="text-lg font-bold text-[#37352f] flex items-center gap-2">
                <Calendar size={20} className="text-[#37352f]" /> 연도별 상세 분석
              </h2>
              
              {/* Year Selectors */}
              <div className="flex flex-wrap gap-1 bg-[#fbfbfa] border border-[#e9e9e7] p-1 rounded-xl">
                {yearlyInsightsData.map((item) => (
                  <button
                    key={item.year}
                    onClick={() => setSelectedYear(item.year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedYear === item.year 
                        ? 'bg-white text-[#2383e2] shadow-sm font-extrabold'
                        : 'text-[#787774] hover:text-[#37352f] hover:bg-[#efefed]'
                    }`}
                  >
                    {item.year.replace('년', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Card Container */}
            <div className="space-y-6 animate-fade-in-up">
              {/* slogan */}
              <div className="p-5 bg-[#fbfbfa] rounded-2xl border border-[#e9e9e7]">
                <span className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider block">연도별 묵상 슬로건</span>
                <p className="text-xl font-bold text-[#37352f] mt-1.5 leading-tight">
                  "{currentInsight.slogan}"
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#2383e2] font-semibold mt-3">
                  <Award size={14} /> {currentInsight.theme}
                </div>
              </div>

              {/* Description */}
              <div className="text-[#37352f] leading-loose text-[15.5px] font-medium whitespace-pre-wrap">
                {currentInsight.description}
              </div>

              {/* Bible focus & Words Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#f2f2f0] pt-6">
                <div>
                  <h4 className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#9b9a97]" /> 대표 묵상 성경
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentInsight.scriptures.map((bible, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs font-bold text-[#2383e2] bg-[#2383e2]/10 px-2.5 py-1 rounded-md">
                        {bible}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Scroll size={14} className="text-[#9b9a97]" /> 당시의 핵심 영적 어휘
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentInsight.words.map((word, idx) => (
                      <span key={idx} className="inline-flex items-center text-xs font-semibold bg-[#f2f2f0] text-[#37352f] px-2.5 py-1 rounded-md">
                        #{word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prayer Tone Bar Chart */}
              <div className="border-t border-[#f2f2f0] pt-6 space-y-4">
                <h4 className="text-xs font-bold text-[#9b9a97] uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={14} className="text-[#9b9a97]" /> 기도의 성격 및 지향점 분석
                </h4>
                
                <div className="space-y-3 bg-[#fbfbfa] p-5 rounded-2xl border border-[#e9e9e7]">
                  {/* Progress Bar 1: 간구 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#37352f] mb-1">
                      <span>도우심을 갈망하는 간구 (Petitional)</span>
                      <span>{currentInsight.tone.petition}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#e9e9e7] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-700" 
                        style={{ width: `${currentInsight.tone.petition}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Bar 2: 조율 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#37352f] mb-1">
                      <span>마음을 주께 튜닝하는 조율 (Tuning)</span>
                      <span>{currentInsight.tone.tuning}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#e9e9e7] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2383e2] transition-all duration-700" 
                        style={{ width: `${currentInsight.tone.tuning}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Bar 3: 위탁 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#37352f] mb-1">
                      <span>온전히 평안에 거하는 위탁 (Trust / Passivity)</span>
                      <span>{currentInsight.tone.trust}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#e9e9e7] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-700" 
                        style={{ width: `${currentInsight.tone.trust}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
