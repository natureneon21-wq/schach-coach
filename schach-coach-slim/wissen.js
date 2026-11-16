// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Wissensdatenbank: freie Schachbücher lesen, durchsuchen (BM25, lokal) und per Gemini befragen.
// Gemini bekommt NUR die gefundenen Auszüge und muss mit Nummern und wörtlichen Zitaten antworten;
// die Zitate werden danach in der App gegen den Originaltext geprüft.

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let meta = null, docs = null, index = null, loading = null;

const STOP = new Set('the a an and or of to in on at is are was were be been it its this that these those with for as by from not but if then so do does did have has had you your he she they we i his her their our which who what when where how can may will would should could than there here also very more most such no nor into out up down over under'.split(' '));
const stem = (w) => (w.length > 4 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const tokenize = (s) => (s.toLowerCase().match(/[a-z0-9àâäéèêëîïôöùûüß]+/g) || []).filter((w) => !STOP.has(w) && w.length > 1).map(stem);

async function loadMeta() {
  if (meta) return meta;
  const r = await fetch('wissen/meta.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('Die Wissensdatenbank ist noch nicht gebaut (beim nächsten Deploy entsteht sie).');
  meta = await r.json();
  return meta;
}

async function loadAll(onProgress) {
  if (index) return;
  if (loading) return loading;
  loading = (async () => {
    await loadMeta();
    docs = [];
    const files = await Promise.all(meta.sources.map(async (s, i) => {
      const r = await fetch(`wissen/${s.id}.json?v=${encodeURIComponent(meta.built)}`);
      const chunks = await r.json();
      onProgress?.(`Lade Quellen … ${i + 1}/${meta.sources.length}`);
      return chunks;
    }));
    files.forEach((chunks, si) => chunks.forEach((c, ci) => docs.push({ s: si, c: ci, h: c.h, t: c.t })));
    onProgress?.('Baue Suchindex …');
    await new Promise((r) => setTimeout(r, 30));
    const inv = new Map(), len = new Int32Array(docs.length);
    docs.forEach((d, i) => {
      const toks = tokenize(`${d.h} ${d.t}`);
      len[i] = toks.length;
      const tf = new Map();
      for (const w of toks) tf.set(w, (tf.get(w) || 0) + 1);
      for (const [w, n] of tf) { let a = inv.get(w); if (!a) inv.set(w, (a = [])); a.push(i, n); }
    });
    index = { inv, len, avg: len.reduce((a, b) => a + b, 0) / Math.max(1, len.length) };
  })();
  try { await loading; } finally { loading = null; }
}

function search(query, k = 8, perSource = 3) {
  const N = docs.length, { inv, len, avg } = index, score = new Map();
  for (const w of new Set(tokenize(query))) {
    const post = inv.get(w);
    if (!post) continue;
    const idf = Math.log(1 + (N - post.length / 2 + 0.5) / (post.length / 2 + 0.5));
    for (let j = 0; j < post.length; j += 2) {
      const d = post[j], tf = post[j + 1];
      score.set(d, (score.get(d) || 0) + idf * (tf * 2.4) / (tf + 1.4 * (0.25 + 0.75 * len[d] / avg)));
    }
  }
  const ranked = [...score].sort((a, b) => b[1] - a[1]);
  const out = [], cnt = {};
  for (const [d] of ranked) {
    const s = docs[d].s;
    if ((cnt[s] || 0) >= perSource) continue;
    cnt[s] = (cnt[s] || 0) + 1;
    out.push(d);
    if (out.length >= k) break;
  }
  return out;
}

async function gemini(settings, system, prompt, temperature = 0.2) {
  if (!settings.apiKey) throw new Error('Kein Gemini-API-Key hinterlegt (Mehr → Einstellungen).');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(settings.model || 'gemini-flash-latest')}:generateContent`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: 2048 },
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `Gemini-Fehler ${r.status}`);
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini hat keine Antwort geliefert.');
  return text;
}

const SYS_TERMS = 'Du wandelst Schachfragen in englische Suchbegriffe für alte englische Schachbücher um. Antworte NUR mit 6 bis 12 kommagetrennten englischen Stichwörtern (Synonyme einschließen, z. B. "pin", "fork", "centre", "opening principles"). Kein weiterer Text.';
const SYS_ANSWER = `Du beantwortest Schachfragen eines Anfängers (etwa 200-300 Elo) auf Deutsch, einfach und kurz (höchstens 200 Wörter).
Du darfst AUSSCHLIESSLICH die nummerierten Auszüge [1], [2], … verwenden. Eigenes Wissen ist verboten, nichts erfinden.
Regeln: Jede inhaltliche Aussage endet mit der Nummer der Quelle, z. B. [2]. Gib mindestens ein WÖRTLICHES Originalzitat (englisch, exakt aus dem Auszug kopiert, höchstens 25 Wörter) in Anführungszeichen mit Nummer an, z. B. "..." [2].
Wenn die Auszüge die Frage nicht beantworten, schreibe genau: "Dazu steht nichts in meinen Quellen." und sonst nichts.
Keine Überschriften, keine Tabellen.`;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function renderAnswer(text, hits) {
  const quotes = [...text.matchAll(/["„“]([^"„“”]{15,400})["“”]/g)].map((m) => m[1]);
  const pool = hits.map((d) => norm(docs[d].t));
  const ok = quotes.filter((q) => pool.some((p) => p.includes(norm(q)))).length;
  const html = esc(text).replace(/\[(\d+)\]/g, (m, n) => `<a href="#" class="ref" data-n="${n}">[${n}]</a>`).replace(/\n/g, '<br>');
  const check = quotes.length
    ? `<div class="qcheck ${ok === quotes.length ? 'good' : 'warn'}">${ok === quotes.length ? '✓' : '⚠'} Zitatprüfung: ${ok} von ${quotes.length} Zitaten wörtlich in den Quellen gefunden${ok < quotes.length ? ' – bitte unten im Originaltext nachlesen' : ''}</div>`
    : '';
  return html + check;
}

export function initWissen(getSettings) {
  const root = $('#view-wissen');
  if (!root) return;
  const ui = { q: $('#wq'), go: $('#wq-go'), status: $('#wq-status'), answer: $('#wq-answer'), passages: $('#wq-passages'),
    sources: $('#wq-sources'), reader: $('#wq-reader'), main: $('#wq-main') };
  let hits = [];

  const showSources = async () => {
    try {
      await loadMeta();
      ui.sources.innerHTML = meta.sources.map((s, i) => `<button class="src" data-i="${i}"><b>${esc(s.title)}</b><small>${esc(s.author)} · ${s.n} Abschnitte · ${esc(s.lic)}</small></button>`).join('')
        || '<p class="note">Noch keine Quellen.</p>';
    } catch (e) { ui.sources.innerHTML = `<p class="note">${esc(e.message)}</p>`; }
  };

  const passageCard = (d, n) => {
    const x = docs[d], s = meta.sources[x.s];
    return `<div class="passage" id="p${n}"><div class="ph"><b>[${n}]</b> ${esc(s.title)} <small>${esc(s.author)}${x.h ? ' · ' + esc(x.h) : ''}</small></div>
      <div class="pt">${esc(x.t)}</div><button class="btn small" data-read="${x.s}:${x.c}">Im Buch lesen</button> <a class="lic" href="${esc(s.url)}" target="_blank" rel="noopener">Quelle (${esc(s.lic)})</a></div>`;
  };

  async function ask() {
    const q = ui.q.value.trim();
    if (!q) return;
    ui.go.disabled = true; ui.answer.innerHTML = ''; ui.passages.innerHTML = '';
    try {
      await loadAll((m) => { ui.status.textContent = m; });
      const settings = getSettings();
      let terms = q;
      if (settings.apiKey) {
        ui.status.textContent = 'Übersetze die Frage in Suchbegriffe …';
        try { terms = `${await gemini(settings, SYS_TERMS, q, 0)} ${q}`; } catch { /* Suche mit Originalfrage */ }
      }
      ui.status.textContent = 'Suche in den Büchern …';
      hits = search(terms, 8);
      if (!hits.length) { ui.status.textContent = 'Nichts Passendes gefunden. Probiere englische Stichwörter.'; return; }
      ui.passages.innerHTML = '<h3>Gefundene Stellen</h3>' + hits.map((d, i) => passageCard(d, i + 1)).join('');
      if (!settings.apiKey) { ui.status.textContent = 'Treffer aus den Büchern (für eine Antwort in Worten: Gemini-Key in den Einstellungen).'; return; }
      ui.status.textContent = 'Gemini formuliert die Antwort nur aus diesen Stellen …';
      const ctx = hits.map((d, i) => `[${i + 1}] (${meta.sources[docs[d].s].title}, ${meta.sources[docs[d].s].author})\n${docs[d].t}`).join('\n\n');
      const text = await gemini(settings, SYS_ANSWER, `Frage: ${q}\n\nAuszüge:\n${ctx}`, 0.2);
      ui.answer.innerHTML = renderAnswer(text, hits);
      ui.status.textContent = 'Antwort aus den Quellen. Die Nummern führen zur Originalstelle.';
    } catch (e) { ui.status.textContent = e.message; }
    finally { ui.go.disabled = false; }
  }

  // Lesemodus: Quelle abschnittsweise lesen
  let cur = { s: 0, from: 0 };
  async function openReader(s, c = 0) {
    try { await loadAll((m) => { ui.status.textContent = m; }); } catch (e) { ui.status.textContent = e.message; return; }
    cur = { s, from: Math.max(0, c - (c % 6)) };
    renderReader(c);
  }
  function renderReader(focus = -1) {
    const src = meta.sources[cur.s], list = docs.filter((d) => d.s === cur.s);
    const page = list.slice(cur.from, cur.from + 6);
    ui.main.hidden = true; ui.reader.hidden = false;
    ui.reader.innerHTML = `<button class="btn small" id="rd-back">← Zurück</button>
      <h3>${esc(src.title)}</h3><p class="note">${esc(src.author)} · <a class="lic" href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.lic)}</a> · Abschnitt ${cur.from + 1}–${cur.from + page.length} von ${list.length}</p>
      ${page.map((d) => `<div class="passage${d.c === focus ? ' focus' : ''}">${d.h ? `<div class="ph"><small>${esc(d.h)}</small></div>` : ''}<div class="pt">${esc(d.t)}</div></div>`).join('')}
      <div class="controls"><button class="btn" id="rd-prev" ${cur.from <= 0 ? 'disabled' : ''}>‹ Zurück</button><button class="btn" id="rd-next" ${cur.from + 6 >= list.length ? 'disabled' : ''}>Weiter ›</button></div>`;
    ui.reader.querySelector('.focus')?.scrollIntoView({ block: 'center' });
    if (focus < 0) root.scrollTop = 0;
  }

  ui.go.addEventListener('click', ask);
  ui.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });
  ui.sources.addEventListener('click', (e) => { const b = e.target.closest('.src'); if (b) openReader(+b.dataset.i, 0); });
  root.addEventListener('click', (e) => {
    const rd = e.target.closest('[data-read]');
    if (rd) { const [s, c] = rd.dataset.read.split(':').map(Number); openReader(s, c); return; }
    const ref = e.target.closest('.ref');
    if (ref) { e.preventDefault(); document.getElementById('p' + ref.dataset.n)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (e.target.id === 'rd-back') { ui.reader.hidden = true; ui.main.hidden = false; }
    if (e.target.id === 'rd-prev') { cur.from = Math.max(0, cur.from - 6); renderReader(); }
    if (e.target.id === 'rd-next') { cur.from += 6; renderReader(); }
  });
  document.querySelector('#tabs [data-view=wissen]')?.addEventListener('click', showSources, { once: true });
}
