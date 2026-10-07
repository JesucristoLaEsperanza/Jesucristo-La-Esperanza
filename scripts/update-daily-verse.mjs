import { writeFile } from 'node:fs/promises';

// Citas locales de Reina-Valera 1909, de dominio público. Funcionan como
// respaldo cuando no hay una clave de API.Bible o no hay versiones autorizadas.
const localVerses = [
  { passageId: 'PSA.23.1', reference: 'Salmo 23:1', book: 'PSA', chapter: 23, content: 'Jehová es mi pastor; nada me faltará.' },
  { passageId: 'PSA.23.3', reference: 'Salmo 23:3', book: 'PSA', chapter: 23, content: 'Confortará mi alma; guiaráme por sendas de justicia por amor de su nombre.' },
  { passageId: 'PSA.23.4', reference: 'Salmo 23:4', book: 'PSA', chapter: 23, content: 'Aunque ande en valle de sombra de muerte, no temeré mal alguno; porque tú estarás conmigo: tu vara y tu cayado me infundirán aliento.' },
  { passageId: 'PSA.23.6', reference: 'Salmo 23:6', book: 'PSA', chapter: 23, content: 'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida: y en la casa de Jehová moraré por largos días.' },
  { passageId: 'PSA.121.1', reference: 'Salmo 121:1', book: 'PSA', chapter: 121, content: 'Alzaré mis ojos á los montes, de donde vendrá mi socorro.' },
  { passageId: 'PSA.121.2', reference: 'Salmo 121:2', book: 'PSA', chapter: 121, content: 'Mi socorro viene de Jehová, que hizo los cielos y la tierra.' },
  { passageId: 'PSA.119.9', reference: 'Salmo 119:9', book: 'PSA', chapter: 119, content: '¿Con qué limpiará el joven su camino? Con guardar tu palabra.' },
  { passageId: 'PSA.119.105', reference: 'Salmo 119:105', book: 'PSA', chapter: 119, content: 'Lámpara es á mis pies tu palabra, y lumbrera á mi camino.' },
  { passageId: 'JOS.1.6', reference: 'Josué 1:6', book: 'JOS', chapter: 1, content: 'Esfuérzate y sé valiente: porque tú repartirás á este pueblo por heredad la tierra, de la cual juré á sus padres que la daría á ellos.' },
  { passageId: 'JOS.1.9', reference: 'Josué 1:9', book: 'JOS', chapter: 1, content: 'Mira que te mando que te esfuerces y seas valiente: no temas ni desmayes, porque Jehová tu Dios será contigo en donde quiera que fueres.' },
  { passageId: 'ISA.41.10', reference: 'Isaías 41:10', book: 'ISA', chapter: 41, content: 'No temas, que yo soy contigo; no desmayes, que yo soy tu Dios que te esfuerzo: siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.' },
  { passageId: 'JHN.3.16', reference: 'Juan 3:16', book: 'JHN', chapter: 3, content: 'Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },
  { passageId: 'MAT.11.28', reference: 'Mateo 11:28', book: 'MAT', chapter: 11, content: 'Venid á mí todos los que estáis trabajados y cargados, que yo os haré descansar.' },
  { passageId: 'MAT.11.29', reference: 'Mateo 11:29', book: 'MAT', chapter: 11, content: 'Llevad mi yugo sobre vosotros, y aprended de mí, que soy manso y humilde de corazón; y hallaréis descanso para vuestras almas.' },
  { passageId: 'MAT.6.33', reference: 'Mateo 6:33', book: 'MAT', chapter: 6, content: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.' },
  { passageId: 'MAT.6.34', reference: 'Mateo 6:34', book: 'MAT', chapter: 6, content: 'Así que, no os congojéis por el día de mañana; que el día de mañana traerá su fatiga: basta al día su afán.' },
  { passageId: 'ROM.8.1', reference: 'Romanos 8:1', book: 'ROM', chapter: 8, content: 'Ahora pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme á la carne, mas conforme al espíritu.' },
  { passageId: 'ROM.8.28', reference: 'Romanos 8:28', book: 'ROM', chapter: 8, content: 'Y sabemos que á los que á Dios aman, todas las cosas les ayudan á bien, es á saber, á los que conforme al propósito son llamados.' },
  { passageId: 'PHP.4.4', reference: 'Filipenses 4:4', book: 'PHP', chapter: 4, content: 'Gozaos en el Señor siempre: otra vez digo: Que os gocéis.' },
  { passageId: 'PHP.4.6-7', reference: 'Filipenses 4:6-7', book: 'PHP', chapter: 4, content: 'Por nada estéis afanosos; sino sean notorias vuestras peticiones delante de Dios en toda oración y ruego, con hacimiento de gracias. Y la paz de Dios, que sobrepuja todo entendimiento, guardará vuestros corazones y vuestros entendimientos en Cristo Jesús.' },
  { passageId: 'PHP.4.13', reference: 'Filipenses 4:13', book: 'PHP', chapter: 4, content: 'Todo lo puedo en Cristo que me fortalece.' },
  { passageId: 'PRO.3.5-6', reference: 'Proverbios 3:5-6', book: 'PRO', chapter: 3, content: 'Fíate de Jehová de todo tu corazón, y no estribes en tu prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.' },
  { passageId: 'JHN.14.6', reference: 'Juan 14:6', book: 'JHN', chapter: 14, content: 'Jesús le dice: Yo soy el camino, y la verdad, y la vida: nadie viene al Padre, sino por mí.' },
  { passageId: 'JHN.14.27', reference: 'Juan 14:27', book: 'JHN', chapter: 14, content: 'La paz os dejo, mi paz os doy: no como el mundo la da, yo os la doy. No se turbe vuestro corazón, ni tenga miedo.' },
];

const API_BASE = 'https://rest.api.bible/v1';
const apiKey = process.env.API_BIBLE_KEY?.trim();

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

const makeRandom = (initialSeed) => {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
};

const shuffle = (items, seed) => {
  const random = makeRandom(seed);
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

// Evita repetir los mismos pasajes durante la rotación anual.
const versesForYear = shuffle(localVerses, todayParts.year);
const verse = versesForYear[(dayOfYear - 1) % versesForYear.length];

const localDailyVerse = {
  date,
  passageId: verse.passageId,
  reference: verse.reference,
  content: verse.content,
  translation: 'Reina-Valera 1909 · Dominio público',
  url: `https://ebible.org/spaRV1909/${verse.book}${String(verse.chapter).padStart(verse.book === 'PSA' ? 3 : 2, '0')}.htm`,
  linkLabel: 'Leer pasaje ↗',
  copyright: 'Texto Reina-Valera 1909 de dominio público. Fuente: eBible.org.',
};

const apiRequest = async (url) => {
  const response = await fetch(url, {
    headers: { 'api-key': apiKey, accept: 'application/json' },
  });
  const bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (_) {
    body = {};
  }
  if (!response.ok) {
    const reason = body?.message || body?.error || bodyText.slice(0, 250) || 'sin detalle';
    throw new Error(`HTTP ${response.status}: ${reason}`);
  }
  return body;
};

const getSpanishBibles = async () => {
  if (!apiKey) return [];

  const url = new URL(`${API_BASE}/bibles`);
  url.searchParams.set('language', 'spa');
  url.searchParams.set('include-full-details', 'true');
  const result = await apiRequest(url);
  return (Array.isArray(result?.data) ? result.data : [])
    .filter((bible) => bible?.type === 'text' && bible?.language?.id === 'spa')
    .filter((bible) => !/1909/.test(`${bible?.name || ''} ${bible?.nameLocal || ''} ${bible?.abbreviation || ''} ${bible?.abbreviationLocal || ''}`))
    .filter((bible) => bible?.id)
    .sort((a, b) => `${a.nameLocal || a.name} ${a.id}`.localeCompare(`${b.nameLocal || b.name} ${b.id}`, 'es'));
};

const toApiPassageId = (passageId) => {
  const match = /^([A-Z0-9]+)\.(\d+)\.(\d+)(?:-(\d+))?$/.exec(passageId);
  if (!match || !match[4]) return passageId;
  return `${match[1]}.${match[2]}.${match[3]}-${match[1]}.${match[2]}.${match[4]}`;
};

const fetchVerseFromBible = async (bible) => {
  const passageId = toApiPassageId(verse.passageId);
  const url = new URL(`${API_BASE}/bibles/${encodeURIComponent(bible.id)}/passages/${encodeURIComponent(passageId)}`);
  url.searchParams.set('content-type', 'text');
  url.searchParams.set('include-titles', 'false');
  url.searchParams.set('include-verse-numbers', 'false');
  url.searchParams.set('fums-version', '3');

  const result = await apiRequest(url);
  const passage = result?.data;
  const content = String(passage?.content || '').replace(/\s+/g, ' ').trim();
  if (!content) throw new Error(`API.Bible no devolvió texto para ${verse.reference}.`);

  const abbreviation = bible.abbreviationLocal || bible.abbreviation || '';
  const translationName = bible.nameLocal || bible.name || abbreviation || 'Versión en español';
  const reference = passage.reference || verse.reference;
  const query = new URLSearchParams({ search: reference, version: abbreviation });
  const infoUrl = String(bible.info || '').match(/https?:\/\/[^\s<>"')]+/)?.[0];
  const isRvr1960 = /reina[\s-]?valera.*1960|rvr\s?1960/i.test(`${translationName} ${abbreviation}`);

  return {
    date,
    passageId: verse.passageId,
    reference,
    content,
    translation: abbreviation ? `${translationName} (${abbreviation})` : translationName,
    abbreviation,
    url: `https://www.biblegateway.com/passage/?${query.toString()}`,
    linkLabel: 'Consultar pasaje ↗',
    copyright: passage.copyright || bible.copyright || `Texto de ${translationName}.`,
    copyrightUrl: infoUrl || (isRvr1960 ? 'https://bibles.com/pages/american-bible-society-rights-and-permissions' : 'https://api.bible'),
    fumsToken: result?.meta?.fumsToken || result?.meta?.fums || '',
    fumsJsInclude: result?.meta?.fumsJsInclude || '',
  };
};

let dailyVerse = localDailyVerse;
if (!apiKey) {
  console.log('API_BIBLE_KEY no está configurada; se usará la rotación local RV1909.');
} else {
  try {
    const bibles = await getSpanishBibles();
    if (bibles.length === 0) {
      console.warn('La clave no tiene versiones de texto en español autorizadas; se usará RV1909.');
    } else {
      // Orden reproducible por año: cada día avanza a otra versión disponible,
      // incluyendo la RV1909 local, sin depender de YouVersion.
      const availableVersions = [
        { id: 'local-rv1909', local: true },
        ...bibles,
      ];
      const versionPool = shuffle(availableVersions, todayParts.year ^ 0x5f3759df);
      const selected = versionPool[(dayOfYear - 1) % versionPool.length];
      const orderedCandidates = [selected, ...versionPool.filter((version) => version.id !== selected.id)];
      for (const bible of orderedCandidates) {
        if (bible.local) {
          dailyVerse = localDailyVerse;
          break;
        }
        try {
          dailyVerse = await fetchVerseFromBible(bible);
          break;
        } catch (error) {
          console.warn(`No se pudo consultar ${bible.nameLocal || bible.name || bible.id}: ${error.message}`);
        }
      }
      if (dailyVerse === localDailyVerse && !orderedCandidates.some((candidate) => candidate.local && candidate.id === selected.id)) {
        console.warn('No se pudo obtener el pasaje desde API.Bible; se usará RV1909.');
      }
    }
  } catch (error) {
    console.warn(`API.Bible no está disponible (${error.message}); se usará RV1909.`);
  }
}

await writeFile(new URL('../daily-verse.json', import.meta.url), `${JSON.stringify(dailyVerse, null, 2)}\n`, 'utf8');
console.log(`Versículo del día: ${date} — ${dailyVerse.reference} · ${dailyVerse.translation}`);
