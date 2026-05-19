const fs = require('fs');
const path = require('path');

const BASE_DIR = 'g:/내 드라이브/아침묵상_장로님/아침묵상_txt';
const OUTPUT_PATH = path.join(__dirname, '../src/data/meditations.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../src/data'))) {
    fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });
}

async function parseFile(filePath) {
    try {
        const fileName = path.basename(filePath, '.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        
        const match = fileName.match(/^(\d{2})(\d{2})(\d{2})\((.)\)(?:-(.*))?$/);
        if (!match) return null;

        const [_, yy, mm, dd, day, bookFromFileName] = match;
        const date = `20${yy}-${mm}-${dd}`;
        const lines = content.split('\n').map(l => l.trim());
        
        let bible_book = bookFromFileName ? bookFromFileName.trim() : "";
        
        // If book name is missing in filename, try to get it from the first line
        if (!bible_book && lines[0]) {
            const firstLineMatch = lines[0].match(/^([가-힣]+)/);
            if (firstLineMatch) {
                bible_book = firstLineMatch[1];
            }
        }

        let scriptureLines = [];
        let reflectionLines = [];
        let prayerLines = [];
        let currentSection = 'scripture';

        // More robust section splitting
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line && scriptureLines.length > 0) continue;

            if (line.includes('하나님!') || line.startsWith('하나님!')) {
                currentSection = 'prayer';
            } else if (currentSection === 'scripture' && scriptureLines.length > 5 && !/^\d+/.test(line)) {
                currentSection = 'reflection';
            }

            if (currentSection === 'scripture') scriptureLines.push(line);
            else if (currentSection === 'reflection') reflectionLines.push(line);
            else if (currentSection === 'prayer') prayerLines.push(line);
        }

        return {
            id: fileName,
            date,
            bible_book: bible_book,
            title: lines[0] || fileName,
            scripture: scriptureLines.join('\n'),
            reflection: reflectionLines.join('\n'),
            prayer: prayerLines.join('\n'),
            raw: content
        };
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return null;
    }
}

async function sync() {
    const allMeditations = [];
    const years = fs.readdirSync(BASE_DIR).filter(d => d.includes('년 아침묵상_txt'));
    
    for (const yearDir of years) {
        const fullYearPath = path.join(BASE_DIR, yearDir);
        const files = fs.readdirSync(fullYearPath).filter(f => f.endsWith('.txt'));
        
        console.log(`Processing ${yearDir}... (${files.length} files)`);
        
        for (const file of files) {
            const filePath = path.join(fullYearPath, file);
            const data = await parseFile(filePath);
            if (data) {
                allMeditations.push(data);
            }
        }
    }

    // Sort by date descending
    allMeditations.sort((a, b) => b.date.localeCompare(a.date));

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allMeditations, null, 2));
    console.log(`Sync complete! ${allMeditations.length} meditations saved to ${OUTPUT_PATH}`);
}

sync();
