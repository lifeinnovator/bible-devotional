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
