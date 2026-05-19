const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// 1. Load env variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found!");
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

const client = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const OLD_TESTAMENT_ORDER = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기',
  '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대기상', '역대기하', '에스라', '느헤미야',
  '에스더', '욥기', '시편', '잠언', '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔',
  '하박국', '스바냐', '학개', '스가랴', '말라기'
];

const NEW_TESTAMENT_ORDER = [
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서',
  '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서',
  '디도서', '빌레몬서', '히브리서', '야고보서', '베드로전서', '베드로후서', '요한일서', '요한이서',
  '요한삼서', '유다서', '요한계시록'
];

const CANONICAL_BOOKS = [...OLD_TESTAMENT_ORDER, ...NEW_TESTAMENT_ORDER];

// Map abbreviations and handle variations
function getCanonicalBook(rawName) {
  if (!rawName) return null;
  let name = rawName.trim();
  
  // Clean punctuation or braces
  name = name.replace(/^[\(\{\[\s]+/, '');
  name = name.replace(/[\)\}\]\s]+$/, '');
  
  // Normalize known abbreviations and typos
  if (name === '창') return '창세기';
  if (name === '출') return '출애굽기';
  if (name === '레') return '레위기';
  if (name === '민') return '민수기';
  if (name === '신') return '신명기';
  if (name === '수' || name === '여') return '여호수아';
  if (name === '사' && rawName.includes('사사기')) return '사사기'; // Avoid mixing with Isaiah (이사야)
  if (name === '사사') return '사사기';
  if (name === '룻') return '룻기';
  
  if (name === '삼상' || name.startsWith('사무엘상')) return '사무엘상';
  if (name === '삼하' || name.startsWith('사무엘하')) return '사무엘하';
  if (name === '왕상' || name.startsWith('열왕기상')) return '열왕기상';
  if (name === '왕하' || name.startsWith('열왕기하') || name.startsWith('열왕기십')) return '열왕기하';
  
  if (name === '대상' || name.startsWith('역대기상') || name.startsWith('역대지상')) return '역대기상';
  if (name === '대하' || name.startsWith('역대기하') || name.startsWith('역대지하')) return '역대기하';
  
  if (name === '스' || name.startsWith('에스라')) return '에스라';
  if (name === '느' || name.startsWith('느헤미야')) return '느헤미야';
  if (name === '에' || name.startsWith('에스더')) return '에스더';
  if (name === '욥' || name.startsWith('욥기')) return '욥기';
  if (name === '시' || name.startsWith('시편')) return '시편';
  if (name === '잠' || name.startsWith('잠언')) return '잠언';
  if (name === '전' || name.startsWith('전도서')) return '전도서';
  if (name === '아' || name.startsWith('아가')) return '아가';
  
  if (name === '사' || name.startsWith('이사야')) return '이사야';
  if (name === '예' || name === '렘' || name.startsWith('예레미야') && !name.includes('애가')) return '예레미야';
  if (name === '애' || name.startsWith('예레미야 메가') || name.startsWith('예레미야애가') || name === '애가') return '예레미야애가';
  if (name === '겔' || name.startsWith('에스겔')) return '에스겔';
  if (name === '단' || name.startsWith('다니엘')) return '다니엘';
  if (name === '호' || name.startsWith('호세아')) return '호세아';
  if (name === '욜' || name.startsWith('요엘')) return '요엘';
  if (name === '암' || name.startsWith('아모스')) return '아모스';
  if (name === '옵' || name.startsWith('오바댜') || name.startsWith('오바디야') || name.startsWith('오바디아') || name.startsWith('오바다')) return '오바댜';
  if (name === '욘' || name.startsWith('요나')) return '요나';
  if (name === '미' || name.startsWith('미가')) return '미가';
  if (name === '나' || name.startsWith('나훔')) return '나훔';
  if (name === '합' || name.startsWith('하박국')) return '하박국';
  if (name === '습' || name.startsWith('스바냐') || name.startsWith('스바나')) return '스바냐';
  if (name === '학' || name.startsWith('학개')) return '학개';
  if (name === '슥' || name.startsWith('스가랴')) return '스가랴';
  if (name === '말' || name.startsWith('말라기')) return '말라기';
  
  if (name === '마' || name.startsWith('마태복음')) return '마태복음';
  if (name === '막' || name.startsWith('마가복음')) return '마가복음';
  if (name === '누' || name.startsWith('누가복음')) return '누가복음';
  if (name === '요' || name === '요한복음' || name === '요한') return '요한복음';
  if (name === '행' || name.startsWith('사도행전')) return '사도행전';
  if (name === '롬' || name.startsWith('로마서')) return '로마서';
  
  if (name === '고전' || name.startsWith('고린도전서') || name.startsWith('고린도전시')) return '고린도전서';
  if (name === '고후' || name.startsWith('고린도후서')) return '고린도후서';
  if (name === '갈' || name.startsWith('갈라디아서')) return '갈라디아서';
  if (name === '엡' || name.startsWith('에베소서')) return '에베소서';
  if (name === '빌' || name.startsWith('빌립보서')) return '빌립보서';
  if (name === '골' || name.startsWith('골로새서')) return '골로새서';
  if (name === '살전' || name.startsWith('데살로니가전서')) return '데살로니가전서';
  if (name === '살후' || name.startsWith('데살로니가후서')) return '데살로니가후서';
  if (name === '딤전' || name.startsWith('디모데전서')) return '디모데전서';
  if (name === '딤후' || name.startsWith('디모데후서')) return '디모데후서';
  if (name === '딛' || name.startsWith('디도서')) return '디도서';
  if (name === '몬' || name.startsWith('빌레몬서')) return '빌레몬서';
  if (name === '히' || name.startsWith('히브리서')) return '히브리서';
  if (name === '야' || name.startsWith('야고보서')) return '야고보서';
  if (name === '벧전' || name.startsWith('베드로전서')) return '베드로전서';
  if (name === '벧후' || name.startsWith('베드로후서')) return '베드로후서';
  
  if (name === '요일' || name.startsWith('요한일서') || name.startsWith('요한1서') || name.startsWith('요한일서서')) return '요한일서';
  if (name === '요이' || name.startsWith('요한이서') || name.startsWith('요한2서')) return '요한이서';
  if (name === '요삼' || name.startsWith('요한삼서') || name.startsWith('요한3서')) return '요한삼서';
  if (name === '유' || name.startsWith('유다서')) return '유다서';
  if (name === '계' || name.startsWith('요한계시록')) return '요한계시록';

  // Fallback prefix matching
  for (const book of CANONICAL_BOOKS) {
    if (name.startsWith(book) || book.startsWith(name)) return book;
  }
  
  return null;
}

// Extract raw book name from title paragraph
function extractBookFromTitle(title) {
  if (!title) return null;
  // Strip starting non-letters e.g. "(", "[", " "
  let cleaned = title.replace(/^[^가-힣a-zA-Z0-9]+/, '');
  // Match first sequence of Korean characters
  const match = cleaned.match(/^([가-힣]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function repair() {
  console.log("Fetching all meditations from database...");
  const res = await client.execute("SELECT date, bible_book, title FROM meditations");
  console.log(`Found ${res.rows.length} total rows.`);
  
  const updates = [];
  
  for (const row of res.rows) {
    const { date, bible_book, title } = row;
    
    // Extract raw book name
    const rawBook = extractBookFromTitle(title);
    if (!rawBook) continue;
    
    // Normalize to canonical Protestant name
    const canonical = getCanonicalBook(rawBook);
    if (!canonical) continue;
    
    // If the book doesn't match the current one, push to update queue!
    if (bible_book !== canonical) {
      updates.push({
        sql: "UPDATE meditations SET bible_book = ? WHERE date = ?",
        args: [canonical, date]
      });
    }
  }
  
  console.log(`Prepared ${updates.length} rows to update. Executing in batches of 50...`);
  
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    await client.batch(batch, "write");
    console.log(`Progress: ${Math.min(i + batchSize, updates.length)} / ${updates.length}`);
  }
  
  console.log(`\n=== DATABASE REPAIR COMPLETE ===`);
  console.log(`Successfully canonicalized and updated ${updates.length} rows!`);
  process.exit(0);
}

repair().catch(err => {
  console.error("Fatal error during repair:", err);
  process.exit(1);
});
