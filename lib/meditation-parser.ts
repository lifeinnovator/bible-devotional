export interface ParsedMeditation {
  title: string;
  scripture: string;
  reflection: string;
  prayer: string;
}

// Splits one raw pasted message (title line, numbered verses, reflection
// paragraphs, then a prayer paragraph starting with "하나님!") into its four
// parts. Mirrors the heuristic already used in scripts/parser_json.js to
// build the historical DB entries, so parsing stays consistent with them.
// On a day with no reflection (e.g. some Saturdays), the prayer section
// simply follows the scripture directly and reflection comes back empty.
export function parseRawMeditation(raw: string): ParsedMeditation {
  const lines = raw.split('\n').map(l => l.trim());
  const title = lines[0] || '';

  const scriptureLines: string[] = [];
  const reflectionLines: string[] = [];
  const prayerLines: string[] = [];
  let currentSection: 'scripture' | 'reflection' | 'prayer' = 'scripture';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line && scriptureLines.length > 0) continue;

    if (line.includes('하나님!') || line.startsWith('하나님!')) {
      currentSection = 'prayer';
    } else if (currentSection === 'scripture' && scriptureLines.length > 0 && !/^\d+(-\d+)?\s/.test(line)) {
      currentSection = 'reflection';
    }

    if (currentSection === 'scripture') scriptureLines.push(line);
    else if (currentSection === 'reflection') reflectionLines.push(line);
    else prayerLines.push(line);
  }

  return {
    title,
    scripture: scriptureLines.join('\n'),
    reflection: reflectionLines.join('\n'),
    prayer: prayerLines.join('\n')
  };
}
