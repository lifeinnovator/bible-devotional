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

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .env.local!");
  process.exit(1);
}

const client = createClient({ url, authToken });

const seedData = [
  {
    year_month: "2026-01",
    slogan: "태초의 창조 질서와 언약적 동행",
    theme: "창세기를 열며 창조와 심판의 섭리 깨닫기",
    description: "창세기 전반부를 집중적으로 묵상하며 태초의 창조 질서와 아담, 노아의 계보 속에서 하나님의 신실하신 약속을 확인했습니다. 바벨탑과 인간의 제멋대로 살려는 유혹을 목도하고, 세상 속에서 높이 쌓으려는 욕망을 버려 하나님의 언약을 실천하겠다는 깊은 조율의 고백이 이어졌습니다.",
    words: JSON.stringify(["창조", "언약", "바벨탑", "질서"])
  },
  {
    year_month: "2026-02",
    slogan: "말씀의 다정한 빛 아래 거하는 은혜",
    theme: "요한복음의 풍성한 평강과 자아 비움",
    description: "요한복음 전반부를 통해 성육신하신 예수 그리스도의 생명의 빛을 인격적으로 묵상했습니다. 엄격한 심판자이기보다 상한 마음을 싸매시는 목자이신 주님의 성품을 깊이 경험하고, 자신의 고주파를 그분의 고요에 공명시키는 평화로운 안식의 여정을 고백했습니다.",
    words: JSON.stringify(["생명", "빛", "목자", "평강"])
  },
  {
    year_month: "2026-03",
    slogan: "선한 목자의 십자가 사랑과 동행",
    theme: "나를 비워 주님을 따르는 절대 순종",
    description: "요한복음의 깊은 가르침을 따라, 우리를 위해 목숨을 버리시는 선한 목자의 사랑에 감격한 계절입니다. 내 생각과 고집을 내려놓고 주님의 음성에 온전히 채널을 맞추어 영적 튜닝을 행하고, 일상에서 드러나야 할 분이 오직 주님의 영광뿐임을 고백하는 자기 부인의 성장이 두드러졌습니다.",
    words: JSON.stringify(["십자가", "순종", "자기부인", "사랑"])
  },
  {
    year_month: "2026-04",
    slogan: "고난을 넘어 부활 영광의 평안으로",
    theme: "가상칠언과 창조의 섭리 속 온전한 위탁",
    description: "예수님의 마지막 고백인 가상칠언과 창세기 족장들의 부르심을 묵상했습니다. 나의 힘과 노력을 완전히 비워내고 오직 십자가 아래에서 모든 미래와 염려를 주님께 전적으로 위탁(Trust)하는 영적 수동성의 절정을 이루어, 어떤 풍파 속에서도 완벽한 평강을 얻었습니다.",
    words: JSON.stringify(["가상칠언", "위탁", "부활", "평안"])
  },
  {
    year_month: "2026-05",
    slogan: "텍스트에서 삶의 콘텍스트로 번역하는 순종",
    theme: "일터와 만남 속 구체적 종의 자세",
    description: "아는 말씀(텍스트)을 실제 삶의 정황(콘텍스트) 속에서 번역해내는 실천적 순종에 집중한 달입니다. 아브라함과 야곱의 여정을 통해 일상 속에서 나그네를 대접하고, 스스로 높아지려 하기보다 낮아져 허물을 덮어주는 성숙한 장성한 자의 삶을 일치시키려 노력하고 있습니다.",
    words: JSON.stringify(["텍스트", "콘텍스트", "실천", "이웃사랑"])
  },
  {
    year_month: "2026-06",
    slogan: "십자가의 지혜로 세상을 이기고 거룩을 지키는 삶",
    theme: "고린도전서를 통해 배운 십자가의 도 분별과 교회 공동체의 거룩함",
    description: "6월 한 달간 고린도전서 전체를 깊이 묵상하며, 분열과 다툼이 가득한 세상 속에서 교회의 본질이자 유일한 기초이신 십자가에 달리신 그리스도를 붙들었습니다. 세상의 영리하고 효율적인 지혜 대신 어리석어 보이는 십자가의 도를 선택하고, 나 자신의 기쁨이나 자유보다는 믿음이 약한 지체들을 실족하게 하지 않으려는 사랑의 절제와 거룩한 삶의 실천을 다짐했습니다.",
    words: JSON.stringify(["십자가", "거룩", "사랑의절제", "공동체"])
  }
];

async function main() {
  try {
    console.log("Creating monthly_insights table if it doesn't exist...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS monthly_insights (
        year_month TEXT PRIMARY KEY,
        slogan TEXT NOT NULL,
        theme TEXT NOT NULL,
        description TEXT NOT NULL,
        words TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'monthly_insights' checked/created successfully.");

    console.log("\nSeeding January-June 2026 monthly insights...");
    for (const data of seedData) {
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO monthly_insights (year_month, slogan, theme, description, words)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [data.year_month, data.slogan, data.theme, data.description, data.words]
      });
      console.log(`Seeded or replaced insight for ${data.year_month}`);
    }

    console.log("\nDatabase migration and seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
