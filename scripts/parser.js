const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BASE_DIR = 'g:/내 드라이브/아침묵상_장로님/아침묵상_txt';
const DB_PATH = path.join(__dirname, '../meditations.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS meditations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        bible_book TEXT,
        title TEXT,
        scripture TEXT,
        reflection TEXT,
        prayer TEXT,
        raw_content TEXT,
        file_path TEXT
    )`);
});

async function parseFile(filePath) {
    const fileName = path.basename(filePath, '.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse Date and Book from filename: 240101(월)-신명기
    const match = fileName.match(/^(\d{2})(\d{2})(\d{2})\(.\)-(.*)$/);
    if (!match) return null;

    const [_, yy, mm, dd, book] = match;
    const date = `20${yy}-${mm}-${dd}`;

    const lines = content.split('\n').map(l => l.trim());
    
    let scriptureLines = [];
    let reflectionLines = [];
    let prayerLines = [];
    let currentSection = 'scripture';

    // Heuristic: Reflection often starts after a blank line following the scripture verses
    // And Prayer often starts with "하나님!" or ends with "아멘"
    
    let foundPrayerStart = false;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        if (line.includes('하나님!') || line.startsWith('하나님!')) {
            foundPrayerStart = true;
            currentSection = 'prayer';
        }

        if (currentSection === 'scripture') {
            // If we see a line that doesn't start with a number and we've already seen some verses,
            // it might be the start of reflection.
            if (scriptureLines.length > 5 && !/^\d+/.test(line) && !line.includes(')')) {
                currentSection = 'reflection';
            }
        }

        if (currentSection === 'scripture') scriptureLines.push(line);
        else if (currentSection === 'reflection') reflectionLines.push(line);
        else if (currentSection === 'prayer') prayerLines.push(line);
    }

    return {
        date,
        bible_book: book.trim(),
        title: lines[0],
        scripture: scriptureLines.join('\n'),
        reflection: reflectionLines.join('\n'),
        prayer: prayerLines.join('\n'),
        raw_content: content,
        file_path: filePath
    };
}

async function sync() {
    const years = fs.readdirSync(BASE_DIR).filter(d => d.includes('년 아침묵상_txt'));
    
    for (const yearDir of years) {
        const fullYearPath = path.join(BASE_DIR, yearDir);
        const files = fs.readdirSync(fullYearPath).filter(f => f.endsWith('.txt'));
        
        console.log(`Processing ${yearDir}...`);
        
        for (const file of files) {
            const filePath = path.join(fullYearPath, file);
            const data = await parseFile(filePath);
            if (data) {
                db.run(`INSERT INTO meditations (date, bible_book, title, scripture, reflection, prayer, raw_content, file_path) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [data.date, data.bible_book, data.title, data.scripture, data.reflection, data.prayer, data.raw_content, data.file_path]
                );
            }
        }
    }
    console.log('Sync complete.');
}

sync();
