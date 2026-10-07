import { writeFile } from 'node:fs/promises';

const appKey = process.env.YOUVERSION_APP_KEY?.trim();
if (!appKey) {
  throw new Error('Falta configurar el secreto YOUVERSION_APP_KEY en GitHub Actions.');
}

const todayParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
}).formatToParts(new Date())
  .filter((part) => part.type !== 'literal')
  .map((part) => [part.type, Number(part.value)]));

const date = `${todayParts.year}-${String(todayParts.month).padStart(2, '0')}-${String(todayParts.day).padStart(2, '0')}`;
const dayOfYear = Math.floor((Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day)
  - Date.UTC(todayParts.year, 0, 1)) / 86400000) + 1;
const headers = {
  'X-YVP-App-Key': appKey,
  Accept: 'application/json',
};

async function getYouVersionJson(path, label) {
  const response = await fetch(`https://api.youversion.com/v1/${path}`, {
    headers,
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${label}: HTTP ${response.status}${body ? ` — ${body.slice(0, 400)}` : ''}`);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${label}: YouVersion devolvió una respuesta que no es JSON válido.`);
  }
}

const verseOfDay = await getYouVersionJson(`verse-of-the-days/${dayOfYear}`, 'Versículo diario');
const passageId = String(verseOfDay?.passage_id || '');
if (!passageId) throw new Error('YouVersion no devolvió la referencia del día.');

const passage = await getYouVersionJson(
  `bibles/149/passages/${encodeURIComponent(passageId)}?format=text`,
  'Texto Reina-Valera 1960',
);
const content = String(passage?.content || '').replace(/\s+/g, ' ').trim();
if (!content) throw new Error(`YouVersion no devolvió el texto de ${passageId}.`);

const dailyVerse = {
  date,
  passageId,
  reference: passage.reference || '',
  content,
  translation: 'Reina-Valera 1960',
};

await writeFile(new URL('../daily-verse.json', import.meta.url), `${JSON.stringify(dailyVerse, null, 2)}\n`, 'utf8');
console.log(`Versículo actualizado: ${date} — ${passageId}`);
