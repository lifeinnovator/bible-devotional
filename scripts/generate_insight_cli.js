const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// 1. Load env variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(".env.local file not found!");
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;
const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .env.local!");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function generateInsight(yearMonth, saveToDb = false) {
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local or environment variables!");
    console.log("Please define GEMINI_API_KEY to execute Gemini API generation.");
    process.exit(1);
  }

  const [year, month] = yearMonth.split('-');
  if (!year || !month || year.length !== 4 || month.length !== 2) {
    console.error("Invalid month format! Please use YYYY-MM (e.g. 2026-06)");
    process.exit(1);
  }

  console.log(`\n=== FETCHING MEDITATIONS FOR ${yearMonth} ===`);
  const query = "SELECT date, bible_book, title, reflection, prayer FROM meditations WHERE date LIKE ? ORDER BY date ASC";
  const res = await client.execute({
    sql: query,
    args: [`${yearMonth}-%`]
  });

  if (res.rows.length === 0) {
    console.warn(`No meditations found for ${yearMonth}. Cannot generate insight.`);
    return;
  }
  console.log(`Found ${res.rows.length} meditations.`);

  console.log("\n=== GENERATING INSIGHT VIA GEMINI API ===");
  const meditationsText = res.rows.map((m, idx) => {
    return `[기록 ${idx + 1}] 날짜: ${m.date}, 본문: ${m.title}\n- 묵상내용: ${m.reflection || ''}\n- 기도문: ${m.prayer || ''}`;
  }).join('\n\n');

  const prompt = `당신은 장로님의 아침 묵상 기록을 종합 분석하여 매월 영적 분석 리포트를 작성하는 전문 신학자이자 목회자 AI 비서입니다.
아래는 2026년 ${month}월 한 달 동안 장로님께서 작성하신 새벽 묵상 기록(성경 말씀 제목, 묵상 내용, 기도문) 목록입니다.
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);
      return;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini returned empty content.");
      return;
    }

    const parsed = JSON.parse(text.trim());
    console.log("\n=== GENERATED INSIGHT RESULT ===");
    console.log(`Year Month:  ${yearMonth}`);
    console.log(`Slogan:      "${parsed.slogan}"`);
    console.log(`Theme:       "${parsed.theme}"`);
    console.log(`Description: "${parsed.description}"`);
    console.log(`Words:       [${parsed.words.join(', ')}]`);

    if (saveToDb) {
      console.log("\n=== SAVING TO TURSO DATABASE ===");
      await client.execute({
        sql: "INSERT OR REPLACE INTO monthly_insights (year_month, slogan, theme, description, words) VALUES (?, ?, ?, ?, ?)",
        args: [yearMonth, parsed.slogan, parsed.theme, parsed.description, JSON.stringify(parsed.words)]
      });
      console.log(`Successfully stored and cached insight for ${yearMonth} in Turso database!`);
    } else {
      console.log("\n[INFO] Run with '--save' flag to store this insight in the Turso database.");
    }
  } catch (err) {
    console.error("Failed to generate or parse Gemini response:", err);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const yearMonthArg = args.find(arg => /^\d{4}-\d{2}$/.test(arg));
const saveFlag = args.includes('--save');

if (!yearMonthArg) {
  console.log("Usage: node scripts/generate_insight_cli.js YYYY-MM [--save]");
  console.log("Example: node scripts/generate_insight_cli.js 2026-06 --save");
  process.exit(0);
}

generateInsight(yearMonthArg, saveFlag).then(() => {
  process.exit(0);
}).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
