// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Baut beim Deploy (GitHub Actions) die Wissensdatenbank: lädt freie Schach-Quellen (Project Gutenberg, Wikibooks),
// zerlegt sie in Textabschnitte und schreibt sie als JSON nach <ausgabeordner>. Die Texte liegen NICHT im Repo.
// Aufruf: node build-wissen.mjs _site/wissen
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = process.argv[2] || 'wissen';
const UA = 'SchachCoachBuild/1.0 (https://github.com/natureneon21-wq/schach-coach; private learning project)';
const MAX_TOTAL = 150e6; // Sicherheitsgrenze in Zeichen
const sources = [];
let total = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.ok) return r;
      console.log(`  HTTP ${r.status} für ${url}`);
    } catch (e) { console.log(`  Fehler ${e.message} für ${url}`); }
    await sleep(800 * (i + 1));
  }
  return null;
}

// --- Text in Abschnitte (ca. 700-1200 Zeichen) zerlegen, Überschriften merken ---
function isHeading(line) {
  const t = line.trim();
  if (!t || t.length > 70) return false;
  if (/^={2,}\s*.+?\s*={2,}$/.test(t)) return true;
  if (/^(chapter|part|book|section|lesson|appendix)\b/i.test(t)) return true;
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length > 3 && letters === letters.toUpperCase() && !/[.!?]$/.test(t);
}
function chunkText(raw) {
  const paras = raw.replace(/\r/g, '').split(/\n\s*\n/);
  const chunks = [];
  let heading = '', buf = '';
  const flush = () => {
    const t = buf.trim();
    buf = '';
    if (t.length < 200) return;
    const letters = (t.match(/[A-Za-z]/g) || []).length;
    if (letters / t.length < 0.6) return; // Zugtabellen, Index, Zahlenkolonnen
    chunks.push({ h: heading, t });
  };
  for (const p of paras) {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.length === 1 && isHeading(lines[0])) { flush(); heading = lines[0].replace(/^=+\s*|\s*=+$/g, ''); continue; }
    const para = lines.join(' ').replace(/\s+/g, ' ');
    if (buf && buf.length + para.length > 1200) flush();
    buf += (buf ? '\n\n' : '') + para;
    if (buf.length >= 700) flush();
  }
  flush();
  return chunks;
}
function addSource(meta, text) { addChunks(meta, chunkText(text)); }
function addChunks(meta, chunks) {
  if (chunks.length < 3) { console.log(`  übersprungen (zu kurz): ${meta.title}`); return; }
  const size = chunks.reduce((n, c) => n + c.t.length, 0);
  if (total + size > MAX_TOTAL) { console.log('  Grenze erreicht, übersprungen:', meta.title); return; }
  total += size;
  const id = 's' + sources.length;
  sources.push({ id, ...meta, n: chunks.length, chars: size, _chunks: chunks });
  console.log(`  + ${meta.title} (${chunks.length} Abschnitte)`);
}

// Minimaler CSV-Parser (Anführungszeichen, Kommas und Zeilenumbrüche in Feldern)
function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// --- Project Gutenberg (gemeinfrei) ---
async function gutenberg() {
  console.log('Project Gutenberg …');
  const books = new Map();
  // Offizieller Katalog (CSV) von Project Gutenberg: alle englischen Texte mit dem Thema "Chess"
  const cat = await get('https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv');
  if (cat) {
    const rows = parseCsv(await cat.text());
    const head = rows.shift() || [];
    const ix = Object.fromEntries(head.map((h, i) => [h, i]));
    for (const r of rows) {
      if (r[ix['Type']] !== 'Text' || !/^en(;|$)/.test(r[ix['Language']] || '')) continue;
      const cs = (r[ix['Subjects']] || '').split(';').filter((x) => /chess/i.test(x));
      const shelf = /chess/i.test(r[ix['Bookshelves']] || '');
      if (!shelf && !cs.some((x) => !/fiction|poetry|drama|juvenile/i.test(x))) continue; // keine Romane
      const id = Number(r[ix['Text#']]);
      books.set(id, { id, title: r[ix['Title']], authors: [{ name: r[ix['Authors']] }], formats: {} });
    }
    console.log(`  Katalog: ${books.size} Schach-Texte`);
  }
  // Fallback, falls der Katalog nicht erreichbar ist
  if (!books.size) [33870].forEach((id) => books.set(id, { id, title: 'Chess Fundamentals', authors: [{ name: 'Capablanca, José Raúl' }], formats: {} }));
  for (const b of books.values()) {
    const txtUrl = Object.entries(b.formats || {}).find(([k]) => k.startsWith('text/plain'))?.[1]
      || `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`;
    const r = await get(txtUrl);
    if (!r) continue;
    let text = await r.text();
    const s = text.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i);
    if (s >= 0) text = text.slice(text.indexOf('\n', s) + 1);
    const e = text.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i);
    if (e >= 0) text = text.slice(0, e);
    addSource({
      title: (b.title || 'Ohne Titel').replace(/\s+/g, ' '),
      author: (b.authors || []).map((a) => a.name).join('; ') || 'unbekannt',
      url: `https://www.gutenberg.org/ebooks/${b.id}`,
      lic: 'Gemeinfrei (Project Gutenberg)',
      lang: 'en',
    }, text);
    await sleep(300);
  }
}

// --- Wikibooks "Chess" (CC BY-SA 4.0) ---
async function wikibooks() {
  console.log('Wikibooks …');
  const api = 'https://en.wikibooks.org/w/api.php';
  const titles = [];
  let cont = '';
  for (let i = 0; i < 6; i++) {
    const r = await get(`${api}?action=query&list=allpages&apprefix=Chess%2F&apnamespace=0&aplimit=500&format=json${cont}`);
    if (!r) break;
    const j = await r.json();
    for (const p of j.query?.allpages || []) titles.push(p.title);
    if (!j.continue) break;
    cont = '&apcontinue=' + encodeURIComponent(j.continue.apcontinue);
  }
  titles.unshift('Chess');
  console.log(`  ${titles.length} Seiten gefunden`);
  const parts = [];
  for (let i = 0; i < titles.length; i += 4) {
    await Promise.all(titles.slice(i, i + 4).map(async (title) => {
      const r = await get(`${api}?action=query&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&formatversion=2`);
      if (!r) return;
      const j = await r.json();
      const text = j.query?.pages?.[0]?.extract || '';
      if (text.length > 400) parts.push({ title, text });
    }));
  }
  parts.sort((a, b) => a.title.localeCompare(b.title));
  // Seiten als Kapitel eines Buches zusammenfassen (Überschrift = Seitentitel)
  const text = parts.map((p) => `== ${p.title.replace(/^Chess\//, 'Chess: ')} ==\n\n${p.text}`).join('\n\n');
  if (text) addSource({
    title: 'Wikibooks: Chess', author: 'Wikibooks-Autoren', url: 'https://en.wikibooks.org/wiki/Chess',
    lic: 'CC BY-SA 4.0 (Wikibooks)', lang: 'en',
  }, text);
}

// --- Wikipedia: Eröffnungen, Taktik, Strategie, Endspiele (CC BY-SA 4.0) ---
async function wikipedia() {
  console.log('Wikipedia …');
  const api = 'https://en.wikipedia.org/w/api.php';
  const cats = [['Eröffnungen', 'Chess openings'], ['Taktik', 'Chess tactics'], ['Strategie', 'Chess strategy'], ['Endspiele', 'Chess endgames']];
  for (const [label, cat] of cats) {
    const r = await get(`${api}?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + cat)}&cmnamespace=0&cmtype=page&cmlimit=250&format=json`);
    if (!r) continue;
    const titles = ((await r.json()).query?.categorymembers || []).map((m) => m.title);
    console.log(`  ${cat}: ${titles.length} Artikel`);
    const parts = [];
    for (let i = 0; i < titles.length; i += 4) {
      await Promise.all(titles.slice(i, i + 4).map(async (title) => {
        const x = await get(`${api}?action=query&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&formatversion=2`);
        if (!x) return;
        const text = (await x.json()).query?.pages?.[0]?.extract || '';
        if (text.length > 600) parts.push({ title, text });
      }));
    }
    parts.sort((a, b) => a.title.localeCompare(b.title));
    const text = parts.map((q) => `== ${q.title} ==\n\n${q.text.replace(/^==+.*==+$/gm, '')}`).join('\n\n');
    if (text) addSource({
      title: `Wikipedia: ${label}`, author: 'Wikipedia-Autoren', url: `https://en.wikipedia.org/wiki/Category:${cat.replace(/ /g, '_')}`,
      lic: 'CC BY-SA 4.0 (Wikipedia)', lang: 'en',
    }, text);
  }
}

// --- Lichess Eröffnungsverzeichnis (CC0): ECO-Code, Name, Zugfolge ---
async function lichessOpenings() {
  console.log('Lichess Eröffnungen …');
  const lines = [];
  for (const f of ['a', 'b', 'c', 'd', 'e']) {
    const r = await get(`https://raw.githubusercontent.com/lichess-org/chess-openings/master/${f}.tsv`);
    if (!r) continue;
    const rows = (await r.text()).split('\n').slice(1).map((l) => l.split('\t')).filter((c) => c.length >= 3);
    for (const [eco, name, pgn] of rows) lines.push({ eco, text: `${eco} ${name}: ${pgn}` });
  }
  if (!lines.length) return;
  const chunks = [];
  for (let i = 0; i < lines.length; i += 10) {
    const g = lines.slice(i, i + 10);
    chunks.push({ h: `ECO ${g[0].eco}–${g[g.length - 1].eco}`, t: g.map((x) => x.text).join('\n') });
  }
  addChunks({
    title: 'Lichess: Eröffnungsverzeichnis (ECO)', author: 'Lichess-Community', url: 'https://github.com/lichess-org/chess-openings',
    lic: 'CC0 (gemeinfrei)', lang: 'en',
  }, chunks);
}

await mkdir(OUT, { recursive: true });
for (const step of [gutenberg, wikibooks, wikipedia, lichessOpenings]) {
  try { await step(); } catch (e) { console.log('Quelle fehlgeschlagen:', e.message); }
}
for (const s of sources) {
  await writeFile(join(OUT, `${s.id}.json`), JSON.stringify(s._chunks));
  delete s._chunks;
}
await writeFile(join(OUT, 'meta.json'), JSON.stringify({ built: new Date().toISOString(), sources }));
console.log(`Fertig: ${sources.length} Quellen, ${(total / 1e6).toFixed(1)} Mio. Zeichen`);
