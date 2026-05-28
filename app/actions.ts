'use server';

import { turso } from "@/lib/turso";
import { revalidatePath } from "next/cache";

export async function getMeditationByDate(dateStr: string) {
  try {
    const result = await turso.execute({
      sql: "SELECT * FROM meditations WHERE date = ?",
      args: [dateStr]
    });
    if (result.rows.length > 0) {
      // Remove any non-serializable objects from libSQL row
      return JSON.parse(JSON.stringify(result.rows[0]));
    }
    return null;
  } catch (error) {
    console.error("Error fetching meditation:", error);
    return null;
  }
}

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

function getCanonicalBook(rawName: string): string | null {
  if (!rawName) return null;
  let name = rawName.trim();
  
  // Strip trailing spaces, digits, and chapter suffixes
  name = name.replace(/\s*\d+([장절편])?$/, '');
  
  // Normalize known typos & abbreviations
  if (name.startsWith('마태복음')) return '마태복음';
  if (name.startsWith('마가복음')) return '마가복음';
  if (name.startsWith('누가복음')) return '누가복음';
  if (name.startsWith('요한복음') || name === '요한') return '요한복음';
  
  if (name.startsWith('사무엘상') || name === '삼상') return '사무엘상';
  if (name.startsWith('사무엘하') || name === '삼하') return '사무엘하';
  if (name.startsWith('열왕기상') || name === '왕상') return '열왕기상';
  if (name.startsWith('열왕기하') || name.startsWith('열왕기십') || name === '왕하') return '열왕기하';
  
  if (name.startsWith('역대기상') || name.startsWith('역대지상') || name === '대상') return '역대기상';
  if (name.startsWith('역대기하') || name.startsWith('역대지하') || name === '대하') return '역대기하';
  
  if (name.startsWith('에스라')) return '에스라';
  if (name.startsWith('욥')) return '욥기';
  if (name.startsWith('잠언')) return '잠언';
  
  if (name.startsWith('예레미야 메가') || name.startsWith('예레미야애가') || name === '애가') return '예레미야애가';
  if (name.startsWith('예레미야')) return '예레미야';
  
  if (name.startsWith('호세아')) return '호세아';
  if (name.startsWith('요엘')) return '요엘';
  if (name.startsWith('오바댜') || name.startsWith('오바디야') || name.startsWith('오바디아') || name.startsWith('오바다')) return '오바댜';
  if (name.startsWith('미가')) return '미가';
  if (name.startsWith('스바냐') || name.startsWith('스바나')) return '스바냐';
  if (name.startsWith('스가랴')) return '스가랴';
  
  if (name.startsWith('고린도전서') || name.startsWith('고린도전시')) return '고린도전서';
  if (name.startsWith('고린도후서')) return '고린도후서';
  
  if (name.startsWith('요한일서') || name.startsWith('요한1서') || name.startsWith('요한일서서')) return '요한일서';
  if (name.startsWith('요한이서') || name.startsWith('요한2서')) return '요한이서';
  if (name.startsWith('요한삼서') || name.startsWith('요한3서')) return '요한삼서';
  
  // Clean general suffixes
  const suffixClean = name.replace(/서$/, '');
  if (CANONICAL_BOOKS.includes(name)) return name;
  if (CANONICAL_BOOKS.includes(suffixClean)) return suffixClean;
  
  // Check prefix match
  for (const book of CANONICAL_BOOKS) {
    if (name.startsWith(book)) return book;
  }
  
  return null;
}

export async function getMeditationsByBook(bookName: string) {
  try {
    let sqlQuery = "";
    let args: string[] = [];

    // Map the selected canonical name to appropriate query to capture noisy database entries
    if (bookName === '마태복음') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '마태복음%' OR bible_book LIKE '마태복음서%' ORDER BY date DESC";
    } else if (bookName === '열왕기하') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '열왕기하%' OR bible_book LIKE '열왕기십%' ORDER BY date DESC";
    } else if (bookName === '역대기상') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '역대기상%' OR bible_book LIKE '역대지상%' OR bible_book LIKE '대상%' ORDER BY date DESC";
    } else if (bookName === '역대기하') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '역대기하%' OR bible_book LIKE '역대지하%' OR bible_book LIKE '대하%' ORDER BY date DESC";
    } else if (bookName === '예레미야애가') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '예레미야애가%' OR bible_book LIKE '예레미야 메가%' OR bible_book LIKE '애가%' ORDER BY date DESC";
    } else if (bookName === '오바댜') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '오바댜%' OR bible_book LIKE '오바디야%' OR bible_book LIKE '오바디아%' OR bible_book LIKE '오바다%' ORDER BY date DESC";
    } else if (bookName === '요한복음') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '요한복음%' OR bible_book = '요한' OR bible_book LIKE '요한 %' ORDER BY date DESC";
    } else if (bookName === '요한일서') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '요한일서%' OR bible_book LIKE '요한1서%' OR bible_book LIKE '요한일서서%' ORDER BY date DESC";
    } else if (bookName === '요한이서') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '요한이서%' OR bible_book LIKE '요한2서%' ORDER BY date DESC";
    } else if (bookName === '요한삼서') {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE '요한삼서%' OR bible_book LIKE '요한3서%' ORDER BY date DESC";
    } else {
      sqlQuery = "SELECT date, bible_book, title, scripture, reflection, prayer FROM meditations WHERE bible_book LIKE ? ORDER BY date DESC";
      args = [`${bookName}%`];
    }

    const result = await turso.execute({
      sql: sqlQuery,
      args
    });
    return JSON.parse(JSON.stringify(result.rows));
  } catch (error) {
    console.error("Error fetching meditations by book:", error);
    return [];
  }
}

export async function getBooksList() {
  try {
    // 1. Fetch all raw rows with bible_book
    const allBooksResult = await turso.execute(
      "SELECT bible_book as name FROM meditations WHERE bible_book IS NOT NULL AND bible_book != '' AND bible_book != 'null'"
    );
    
    // 2. Count occurrences of each canonical book name
    const bookCounts = new Map<string, number>();
    allBooksResult.rows.forEach(row => {
      const rawName = row.name as string;
      const canonical = getCanonicalBook(rawName);
      if (canonical) {
        bookCounts.set(canonical, (bookCounts.get(canonical) || 0) + 1);
      }
    });
    
    // 3. Construct the full 66 book list with strict Protestant order
    const oldTestament = OLD_TESTAMENT_ORDER.map(name => ({
      name,
      count: bookCounts.get(name) || 0
    }));
    
    const newTestament = NEW_TESTAMENT_ORDER.map(name => ({
      name,
      count: bookCounts.get(name) || 0
    }));
    
    return {
      oldTestament,
      newTestament
    };
  } catch (error) {
    console.error("Error fetching books list:", error);
    return {
      oldTestament: OLD_TESTAMENT_ORDER.map(name => ({ name, count: 0 })),
      newTestament: NEW_TESTAMENT_ORDER.map(name => ({ name, count: 0 }))
    };
  }
}

export async function saveMeditation(meditation: {
  date: string;
  bible_book: string;
  title: string;
  scripture: string;
  reflection: string;
  prayer: string;
}) {
  try {
    await turso.execute({
      sql: "INSERT INTO meditations (date, bible_book, title, scripture, reflection, prayer) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        meditation.date,
        meditation.bible_book,
        meditation.title,
        meditation.scripture,
        meditation.reflection,
        meditation.prayer
      ]
    });
    
    // Clear and force-rebuild Next.js page route caches to display new item instantly!
    revalidatePath('/');
    revalidatePath('/bookshelf');
    revalidatePath('/search');
    
    return { success: true };
  } catch (error) {
    console.error("Error saving meditation:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateMeditation(meditation: {
  date: string;
  bible_book: string;
  title: string;
  scripture: string;
  reflection: string;
  prayer: string;
}) {
  try {
    let book = meditation.bible_book || "";
    if (!book && meditation.title) {
      const match = meditation.title.match(/^([가-힣\s]+)\s*\d+/);
      if (match) {
        const canonical = getCanonicalBook(match[1]);
        if (canonical) book = canonical;
      }
    }

    await turso.execute({
      sql: "UPDATE meditations SET bible_book = ?, title = ?, scripture = ?, reflection = ?, prayer = ? WHERE date = ?",
      args: [
        book,
        meditation.title,
        meditation.scripture,
        meditation.reflection,
        meditation.prayer,
        meditation.date
      ]
    });
    
    revalidatePath('/');
    revalidatePath('/bookshelf');
    revalidatePath('/search');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating meditation:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteMeditation(date: string) {
  try {
    await turso.execute({
      sql: "DELETE FROM meditations WHERE date = ?",
      args: [date]
    });
    
    revalidatePath('/');
    revalidatePath('/bookshelf');
    revalidatePath('/search');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting meditation:", error);
    return { success: false, error: String(error) };
  }
}

export async function get2026MonthlyInsights() {
  try {
    const result = await turso.execute("SELECT date, bible_book, title, reflection, prayer FROM meditations WHERE date LIKE '2026-%'");
    
    const themes: { [key: string]: { slogan: string, theme: string, description: string, words: string[] } } = {
      "01": {
        slogan: "태초의 창조 질서와 언약적 동행",
        theme: "창세기를 열며 창조와 심판의 섭리 깨닫기",
        description: "창세기 전반부를 집중적으로 묵상하며 태초의 창조 질서와 아담, 노아의 계보 속에서 하나님의 신실하신 약속을 확인했습니다. 바벨탑과 인간의 제멋대로 살려는 유혹을 목도하고, 세상 속에서 높이 쌓으려는 욕망을 버려 하나님의 언약을 실천하겠다는 깊은 조율의 고백이 이어졌습니다.",
        words: ["창조", "언약", "바벨탑", "질서"]
      },
      "02": {
        slogan: "말씀의 다정한 빛 아래 거하는 은혜",
        theme: "요한복음의 풍성한 평강과 자아 비움",
        description: "요한복음 전반부를 통해 성육신하신 예수 그리스도의 생명의 빛을 인격적으로 묵상했습니다. 엄격한 심판자이기보다 상한 마음을 싸매시는 목자이신 주님의 성품을 깊이 경험하고, 자신의 고주파를 그분의 고요에 공명시키는 평화로운 안식의 여정을 고백했습니다.",
        words: ["생명", "빛", "목자", "평강"]
      },
      "03": {
        slogan: "선한 목자의 십자가 사랑과 동행",
        theme: "나를 비워 주님을 따르는 절대 순종",
        description: "요한복음의 깊은 가르침을 따라, 우리를 위해 목숨을 버리시는 선한 목자의 사랑에 감격한 계절입니다. 내 생각과 고집을 내려놓고 주님의 음성에 온전히 채널을 맞추어 영적 튜닝을 행하고, 일상에서 드러나야 할 분이 오직 주님의 영광뿐임을 고백하는 자기 부인의 성장이 두드러졌습니다.",
        words: ["십자가", "순종", "자기부인", "사랑"]
      },
      "04": {
        slogan: "고난을 넘어 부활 영광의 평안으로",
        theme: "가상칠언과 창조의 섭리 속 온전한 위탁",
        description: "예수님의 마지막 고백인 가상칠언과 창세기 족장들의 부르심을 묵상했습니다. 나의 힘과 노력을 완전히 비워내고 오직 십자가 아래에서 모든 미래와 염려를 주님께 전적으로 위탁(Trust)하는 영적 수동성의 절정을 이루어, 어떤 풍파 속에서도 완벽한 평강을 얻었습니다.",
        words: ["가상칠언", "위탁", "부활", "평안"]
      },
      "05": {
        slogan: "텍스트에서 삶의 콘텍스트로 번역하는 순종",
        theme: "일터와 만남 속 구체적 종의 자세",
        description: "아는 말씀(텍스트)을 실제 삶의 정황(콘텍스트) 속에서 번역해내는 실천적 순종에 집중한 달입니다. 아브라함과 야곱의 여정을 통해 일상 속에서 나그네를 대접하고, 스스로 높아지려 하기보다 낮아져 허물을 덮어주는 성숙한 장성한 자의 삶을 일치시키려 노력하고 있습니다.",
        words: ["텍스트", "콘텍스트", "실천", "이웃사랑"]
      },
      "06": {
        slogan: "남은 반년을 기대하며 주의 선하심을 앙망함",
        theme: "하반기 영적 도약을 위한 기도의 지경 확장",
        description: "매월 1일 정기 업데이트 계획에 따라 정밀하고 은혜로운 하반기 분석 리포트가 대기 중입니다. 계속되는 장로님의 묵상 흔적을 따라 하나님의 신실하신 역사가 dynamic하게 추가될 예정입니다.",
        words: ["하반기", "소망", "기대", "믿음"]
      }
    };
    
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
      
      const info = themes[m] || {
        slogan: `${m}월의 소망과 동행`,
        theme: `장로님의 ${m}월 매일 묵상 여정`,
        description: `매월 1일 정기 분석에 따라 데이터가 동적으로 업데이트되는 ${m}월 분석 카드입니다. 장로님께서 올려드린 새벽 제단과 말씀이 기록되는 대로 자동 반영됩니다.`,
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
    console.error("Error generating monthly insights:", error);
    return [];
  }
}

