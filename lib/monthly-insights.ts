import { turso } from "@/lib/turso";

export interface MonthlyInsight {
  slogan: string;
  theme: string;
  description: string;
  words: string[];
}

export async function generateInsightWithGemini(yearMonth: string, meditations: any[]): Promise<MonthlyInsight | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const meditationsText = meditations.map((m, idx) => {
      return `[기록 ${idx + 1}] 날짜: ${m.date}, 본문: ${m.title}\n- 묵상내용: ${m.reflection || ''}\n- 기도문: ${m.prayer || ''}`;
    }).join('\n\n');

    const [year, month] = yearMonth.split('-');
    const prompt = `당신은 장로님의 아침 묵상 기록을 종합 분석하여 매월 영적 분석 리포트를 작성하는 전문 신학자이자 목회자 AI 비서입니다.
아래는 ${year}년 ${month}월 한 달 동안 장로님께서 작성하신 새벽 묵상 기록(성경 말씀 제목, 묵상 내용, 기도문) 목록입니다.
이 기록들을 철저하게 분석하여, 장로님의 영적 흐름을 대표하는 리포트를 한국어로 작성해 주세요.

[묵상 기록 목록]
${meditationsText}

응답은 반드시 아래 형식의 JSON 객체로만 출력해 주세요. 다른 설명 텍스트 없이 오직 JSON 문자열만 반환해야 합니다:
{
  "slogan": "한 달의 영적 핵심을 관통하는 함축적이고 깊이 있는 짧은 슬로건 (예: '말씀의 다정한 빛 아래 거하는 은혜')",
  "theme": "성경 본문과 묵상의 핵심 방향을 나타내는 주제 한 줄 (예: '요한복음의 풍성한 평강과 자아 비움')",
  "description": "장로님의 묵상 내용을 종합적으로 요약하고 은혜롭게 서술한 2~3문장의 상세 분석 리포트. 장로님이 묵상한 본문명(예: 고린도전서 등)과 핵심 고백을 포함하여 차분하고 영적인 어조로 작성해 주세요. 반드시 3인칭 경어체(예: '~묵상했습니다', '~확인했습니다', '~고백했습니다', '장로님께서 ~')를 사용해야 합니다.",
  "words": ["핵심 영적 단어 4개"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini returned empty content");
      return null;
    }

    const parsed = JSON.parse(text.trim());
    if (parsed.slogan && parsed.theme && parsed.description && Array.isArray(parsed.words)) {
      return {
        slogan: String(parsed.slogan),
        theme: String(parsed.theme),
        description: String(parsed.description),
        words: parsed.words.map(String)
      };
    }
    console.error("Gemini JSON structure is invalid:", parsed);
    return null;
  } catch (error) {
    console.error("Error generating insight with Gemini:", error);
    return null;
  }
}

export async function saveMonthlyInsight(yearMonth: string, insight: MonthlyInsight) {
  await turso.execute({
    sql: "INSERT OR REPLACE INTO monthly_insights (year_month, slogan, theme, description, words) VALUES (?, ?, ?, ?, ?)",
    args: [yearMonth, insight.slogan, insight.theme, insight.description, JSON.stringify(insight.words)]
  });
}

// Generates (via Gemini) and caches the insight for one year-month, e.g. "2026-07".
// Returns null if there are no meditations for that month or generation failed.
export async function generateAndCacheMonthlyInsight(yearMonth: string): Promise<MonthlyInsight | null> {
  const result = await turso.execute({
    sql: "SELECT date, bible_book, title, reflection, prayer FROM meditations WHERE date LIKE ?",
    args: [`${yearMonth}-%`]
  });
  if (result.rows.length === 0) return null;

  const insight = await generateInsightWithGemini(yearMonth, result.rows);
  if (insight) {
    await saveMonthlyInsight(yearMonth, insight);
  }
  return insight;
}

// Reads meditation counts/tone + cached insights for a given year, for display.
// Does NOT call Gemini — insights are populated ahead of time by the monthly cron job.
export async function getMonthlyInsights(year: number) {
  try {
    const result = await turso.execute({
      sql: "SELECT date, bible_book, title, reflection, prayer FROM meditations WHERE date LIKE ?",
      args: [`${year}-%`]
    });

    const dbInsightsMap: { [key: string]: MonthlyInsight } = {};
    try {
      const dbInsightsResult = await turso.execute({
        sql: "SELECT year_month, slogan, theme, description, words FROM monthly_insights WHERE year_month LIKE ?",
        args: [`${year}-%`]
      });
      dbInsightsResult.rows.forEach(row => {
        const ym = String(row.year_month || '');
        const monthPart = ym.split('-')[1];
        if (monthPart) {
          try {
            dbInsightsMap[monthPart] = {
              slogan: String(row.slogan || ''),
              theme: String(row.theme || ''),
              description: String(row.description || ''),
              words: JSON.parse(String(row.words || '[]'))
            };
          } catch (e) {
            console.error("Error parsing db insight words:", e);
          }
        }
      });
    } catch (dbErr) {
      console.warn("Could not load from monthly_insights table.", dbErr);
    }

    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    const monthlyData = months.map(m => {
      const rows = result.rows.filter(x => String(x.date || '').substring(5, 7) === m);
      const count = rows.length;

      const bookCounts: { [key: string]: number } = {};
      let combinedText = '';
      rows.forEach(r => {
        const bookName = String(r.bible_book || '');
        if (bookName) {
          bookCounts[bookName] = (bookCounts[bookName] || 0) + 1;
        }
        combinedText += ' ' + String(r.reflection || '') + ' ' + String(r.prayer || '');
      });

      const sortedBooks = Object.keys(bookCounts).sort((a, b) => bookCounts[b] - bookCounts[a]);

      const petitionKeywords = ['도와', '간구', '원합니다', '주소서', '해주세', '채워', '부탁'];
      const tuningKeywords = ['조율', '성품', '동행', '음성', '듣', '튜닝', '닮', '가치관', '마음', '회개', '성찰'];
      const trustKeywords = ['위탁', '맡깁', '수동성', '평강', '안식', '비움', '순종', '고요', '아멘', '신뢰', '평안'];

      let petScore = 0;
      let tunScore = 0;
      let truScore = 0;

      petitionKeywords.forEach(kw => {
        const matches = combinedText.match(new RegExp(kw, 'g'));
        if (matches) petScore += matches.length;
      });
      tuningKeywords.forEach(kw => {
        const matches = combinedText.match(new RegExp(kw, 'g'));
        if (matches) tunScore += matches.length;
      });
      trustKeywords.forEach(kw => {
        const matches = combinedText.match(new RegExp(kw, 'g'));
        if (matches) truScore += matches.length;
      });

      const totalScore = petScore + tunScore + truScore || 1;
      let petition = Math.round((petScore / totalScore) * 100);
      let tuning = Math.round((tunScore / totalScore) * 100);
      let trust = Math.round((truScore / totalScore) * 100);

      const sum = petition + tuning + trust;
      if (sum !== 100 && sum > 0) {
        const diff = 100 - sum;
        trust += diff;
      }

      const defaultTones: { [key: string]: { petition: number, tuning: number, trust: number } } = {
        "01": { petition: 10, tuning: 40, trust: 50 },
        "02": { petition: 10, tuning: 45, trust: 45 },
        "03": { petition: 15, tuning: 35, trust: 50 },
        "04": { petition: 10, tuning: 25, trust: 65 },
        "05": { petition: 15, tuning: 45, trust: 40 },
        "default": { petition: 10, tuning: 20, trust: 70 }
      };

      const defaultTone = defaultTones[m] || defaultTones["default"];

      const info: MonthlyInsight = dbInsightsMap[m] || {
        slogan: `${parseInt(m)}월의 소망과 동행`,
        theme: `장로님의 ${parseInt(m)}월 매일 묵상 여정`,
        description: `매월 1일 정기 분석에 따라 데이터가 동적으로 업데이트되는 ${parseInt(m)}월 분석 카드입니다. 장로님께서 올려드린 새벽 제단과 말씀이 기록되는 대로 자동 반영됩니다.`,
        words: ["말씀", "기도", "은혜", "소망"]
      };

      return {
        month: `${parseInt(m)}월`,
        count,
        slogan: info.slogan,
        theme: info.theme,
        description: info.description,
        scriptures: count > 0 ? sortedBooks.slice(0, 3) : ["창세기", "요한복음"],
        words: info.words,
        tone: count > 0 ? { petition, tuning, trust } : defaultTone
      };
    });

    return JSON.parse(JSON.stringify(monthlyData));
  } catch (error) {
    console.error("Error loading monthly insights:", error);
    return [];
  }
}

// Returns the previous calendar month's "YYYY-MM" relative to now, in KST (UTC+9).
export function getPreviousYearMonthKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCDate(0); // moves to the last day of the previous month (UTC fields, but we've already shifted to KST wall-clock)
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isFirstOfMonthKST(): boolean {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.getUTCDate() === 1;
}
