// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
import { Chess } from './vendor/chess.js';
import { Engine } from './engine.js';
import { Board } from './board.js';
import { createCoach, MOOD_FOR, coachName } from './coach.js';
import { LOOK_DEFAULTS, applyLook, initLookSettings } from './look.js';
import {
  CLASSES, classify, winPct, moveAccuracy, uciParts, pvToSan, uciToSan,
  weakPieces, explainMove, hintFor, PRAISE, pick,
} from './analysis.js';
import { askGemini, moveExplainPrompt, gameSummaryPrompt } from './gemini.js';
import { initWissen } from './wissen.js';
import { TONES, tone } from './persona.js';

/* ---------- Hilfsfunktionen & Speicher ---------- */
const $ = (s, r = document) => r.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('schach.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('schach.' + k, JSON.stringify(v)); } catch { /* voll */ } },
};
const settings = Object.assign(
  { apiKey: '', model: 'gemini-flash-latest', showLegal: true, retryOffer: true, level: 400, color: 'r', tone: 'freundlich', coachMode: 'live', tcM: 0, tcInc: 0, ...LOOK_DEFAULTS },
  store.get('settings', {}),
);
if (settings.model === 'gemini-3.8-flash') settings.model = 'gemini-flash-latest'; // wurde von der API abgelehnt
const saveSettings = () => store.set('settings', settings);

/* ---------- Tonalität des Coachs ---------- */
const TN = () => tone(settings.tone);
const praise = (id) => TN().praise?.[id] || PRAISE[id];
const badOpen = (id) => TN().bad?.[id] || '';

/* ---------- Eigene Elo-Schätzung (aus den Ergebnissen gegen die Bots) ----------
   Elo-Formel mit Startwert 300. Die ersten 10 Partien zählen stärker. Partien mit Zugrücknahmen zählen halb.
   Die Bot-Zahlen sind eine grobe Stockfish-Skala, deshalb ist das eine Schätzung und keine offizielle Wertung. */
const RATING_START = 300;
const getRating = () => store.get('rating', { r: RATING_START, n: 0, hist: [] });
function updateRating(result, oppElo, takebacks) {
  const R = getRating();
  const S = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const E = 1 / (1 + Math.pow(10, (oppElo - R.r) / 400));
  let K = R.n < 10 ? 40 : 24;
  if (takebacks > 0) K *= 0.5;
  const before = R.r;
  R.r = Math.max(100, Math.min(3200, Math.round(R.r + K * (S - E))));
  R.n++;
  R.hist = [...R.hist, { t: Date.now(), r: R.r, opp: oppElo, res: result }].slice(-60);
  store.set('rating', R);
  return { r: R.r, d: R.r - before, n: R.n };
}
function ratingLine(u) { return `Deine geschätzte Elo: ${u.r} (${u.d >= 0 ? '+' : ''}${u.d})${u.n < 10 ? ' – noch vorläufig' : ''}.`; }
function renderRating() {
  const el = $('#rating-box');
  if (!el) return;
  const R = getRating();
  if (!R.n) { el.innerHTML = '<b>Deine geschätzte Elo: ca. ' + RATING_START + '</b><small>Startwert. Nach deiner ersten Partie beginnt die Schätzung.</small>'; return; }
  const pts = R.hist.map((h) => h.r), lo = Math.min(...pts) - 10, hi = Math.max(...pts) + 10;
  const line = pts.length > 1 ? `<svg viewBox="0 0 200 40" preserveAspectRatio="none"><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${pts.map((v, i) => `${(i / (pts.length - 1)) * 200},${40 - ((v - lo) / (hi - lo)) * 36 - 2}`).join(' ')}"/></svg>` : '';
  el.innerHTML = `<b>Deine geschätzte Elo: ${R.r}</b><small>${R.n} Partien${R.n < 10 ? ' · noch vorläufig, wird mit jeder Partie genauer' : ''}. Schätzung aus den Ergebnissen gegen die Bots, nicht mit Online-Elo vergleichbar.</small>${line}`;
}

/* ---------- Bot-Stufen: 200 bis 3000 Elo in 50er-Schritten ----------
   Unter ~1350 Elo: Stockfish mit Tiefenlimit + zufälliger Auswahl unter den besten Zügen (Softmax).
   Ab 1350 Elo: Stockfish mit eingebauter Stärkebegrenzung (UCI_Elo). Die Zahlen sind eine grobe Stockfish-Skala. */
const OLD_ELOS = [200, 400, 600, 800, 1000]; // alte gespeicherte Partien/Einstellungen speicherten den Index 0-4
const ANCHORS = [ // elo, Tiefe, MultiPV, Softmax-Temperatur
  [200, 1, 6, 260], [400, 2, 5, 160], [600, 3, 4, 90], [800, 5, 3, 50], [1000, 8, 3, 25], [1200, 10, 2, 12], [1350, 12, 2, 8],
];
const NAMES = [[200, 'Anfänger-Bot'], [400, 'Spaziergänger'], [600, 'Vereinsneuling'], [800, 'Hobbyspieler'], [1000, 'Clubspieler'],
  [1200, 'Fortgeschrittener'], [1400, 'Vereinsspieler'], [1600, 'Turnierspieler'], [1800, 'Kandidat'], [2000, 'Meisterkandidat'],
  [2200, 'FIDE-Meister-Niveau'], [2400, 'Internationaler Meister'], [2600, 'Großmeister'], [2800, 'Weltklasse'], [3000, 'Engine-Monster']];
function levelInfo(x) {
  const num = x <= 10 ? OLD_ELOS[Math.max(0, Math.min(4, Math.round(x)))] : Math.max(200, Math.min(3000, Math.round(x / 50) * 50));
  const name = NAMES.filter((n) => n[0] <= num).pop()[1];
  let a = ANCHORS[ANCHORS.length - 1];
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [e1, d1, m1, t1] = ANCHORS[i], [e2, d2, m2, t2] = ANCHORS[i + 1];
    if (num >= e1 && num <= e2) { const f = (num - e1) / (e2 - e1); a = [num, Math.round(d1 + (d2 - d1) * f), Math.round(m1 + (m2 - m1) * f), t1 + (t2 - t1) * f]; break; }
  }
  return { name, elo: '~' + num, num, depth: a[1], multipv: a[2], temp: a[3], uci: num >= 1350 };
}
// LEVELS[x] liefert die Stufe zu einem Wert (Elo oder alter Index), damit der übrige Code unverändert bleibt.
const LEVELS = new Proxy([], { get: (t, k) => (/^\d+$/.test(String(k)) ? levelInfo(+k) : t[k]) });

/* ---------- Engine ---------- */
const engine = new Engine();
let engineOK = true;
engine.init().catch(() => { engineOK = false; });
async function ana(fen, opts) {
  if (!engineOK) return null;
  try { return await engine.analyze(fen, opts); } catch { engineOK = false; return null; }
}

/* ---------- Navigation ---------- */
function switchView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'review') { renderHistory(); renderRating(); }
  if (name === 'train') enterTrain();
}
document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
initWissen(() => settings);

/* ---------- Trainerin & Bretter ---------- */
applyLook(settings);
settings.coachName = coachName(settings.avatar);
const coach = createCoach($('#coach-play'), settings.avatar);
const coachTrain = createCoach($('#coach-train'), settings.avatar);
const coachReview = createCoach($('#coach-review'), settings.avatar);
const board = new Board($('#board'), { onMove: (f, t, p) => onUserMove(f, t, p) });
const boardTrain = new Board($('#board-train'), { onMove: (f, t, p) => onTrainMove(f, t, p) });
const boardReview = new Board($('#board-review'), { onMove: () => {} });

const whoName = (c) => (c === 'w' ? 'Weiß' : 'Schwarz');
const sanOf = (mv) => mv.san;
const uciOf = (mv) => mv.from + mv.to + (mv.promotion || '');
function recFrom(mv) {
  return { san: mv.san, uci: uciOf(mv), from: mv.from, to: mv.to, by: mv.color, fenBefore: mv.before, fenAfter: mv.after };
}

/* ---------- Bewertung eines Zuges ---------- */
async function evaluateMove(prevRes, rec) {
  if (!prevRes || !prevRes.lines.length) return null;
  const best = prevRes.lines[0];
  const bestUci = best.pv[0];
  const after = new Chess(rec.fenAfter);
  let value, reply;
  const line = prevRes.lines.find((l) => l.pv[0] === rec.uci);
  if (after.isCheckmate()) value = 10000;
  else if (after.isGameOver()) value = 0;
  else if (line) { value = line.score; reply = line.pv[1]; }
  else {
    const a = await ana(rec.fenAfter, { movetime: 400, multipv: 1 });
    if (!a || !a.lines.length) return null;
    value = -a.lines[0].score; reply = a.lines[0].pv[0];
  }
  const loss = Math.max(0, winPct(best.score) - winPct(value));
  return { cls: classify(loss, rec.uci === bestUci), loss, bestUci, reply, bestScore: best.score, value, pv: best.pv };
}

function geminiData(rec, fb) {
  const ex = explainMove({ fenBefore: rec.fenBefore, played: rec.uci, bestUci: fb.bestUci, replyUci: fb.reply, cls: fb.cls });
  return {
    fenBefore: rec.fenBefore, playedSan: rec.san, who: whoName(rec.by), clsLabel: fb.cls.label, loss: fb.loss,
    bestSan: uciToSan(rec.fenBefore, fb.bestUci), pv: pvToSan(rec.fenBefore, fb.pv, 5), facts: ex.facts,
  };
}
function cleanAI(t) { return t.replace(/\*+/g, '').replace(/^#+\s*/gm, ''); }

/* =====================================================================
   SPIELEN
   ===================================================================== */
let G = null;

/* ---------- Schachuhr ---------- */
const TC_PRESETS = [[0, 0, 'Unbegrenzt'], [3, 2, 'Blitz 3+2'], [5, 3, 'Blitz 5+3'], [10, 0, 'Schnell 10+0'], [15, 10, 'Schnell 15+10'], [30, 0, 'Lang 30+0']];
let clockTimer = null;
function fmtClock(ms) {
  ms = Math.max(0, ms);
  const s = ms / 1000;
  if (s < 10) return s.toFixed(1);
  const t = Math.ceil(s), m = Math.floor(t / 60);
  return m + ':' + String(t % 60).padStart(2, '0');
}
function clockOn() { return !!(G && G.clock); }
function clockLeft(col) {
  const k = G.clock;
  return k[col] - (!G.over && k.run === col ? Date.now() - k.t0 : 0);
}
function renderClock() {
  const box = $('#clocks');
  if (!clockOn()) { box.hidden = true; document.body.classList.remove('has-clock'); return; }
  box.hidden = false; document.body.classList.add('has-clock');
  const me = G.userColor, op = me === 'w' ? 'b' : 'w';
  for (const [id, col] of [['#clk-op', op], ['#clk-me', me]]) {
    const el = $(id), ms = clockLeft(col);
    el.querySelector('b').textContent = fmtClock(ms);
    el.classList.toggle('run', !G.over && G.clock.run === col);
    el.classList.toggle('low', ms < 20000);
  }
}
function clockStart(color) { if (clockOn()) { G.clock.run = color; G.clock.t0 = Date.now(); } }
// Zug von `col` ist gespielt: Zeit abziehen, Inkrement geben, Gegner starten. minUsed = simulierte Mindest-Bedenkzeit (Bot)
function clockMove(col, minUsed = 0) {
  if (!clockOn() || G.over) return;
  const k = G.clock;
  const used = Math.max(Date.now() - k.t0, minUsed);
  k[col] = Math.max(0, k[col] - used) + k.inc;
  k.run = col === 'w' ? 'b' : 'w'; k.t0 = Date.now();
  renderClock();
}
function clockTick() {
  if (!G || !G.clock || G.over) return renderClock();
  renderClock();
  const col = G.clock.run;
  if (clockLeft(col) <= 0) flagFall(col);
}
function flagFall(col) {
  if (G.over) return;
  G.over = true; G.busy = false; G.clock[col] = 0; G.hint = null;
  const mine = col === G.userColor;
  const result = mine ? 'loss' : 'win';
  G.result = result;
  let text = mine ? 'Deine Zeit ist abgelaufen. Das passiert – beim nächsten Mal früher entscheiden und nicht jeden Zug neu durchrechnen.' : 'Der Gegner hat keine Zeit mehr. Du gewinnst auf Zeit!';
  if (!G.rated) { G.rated = true; text += '\n' + ratingLine(updateRating(result, LEVELS[G.level].num, G.takebacks)); }
  coach.say(text, mine ? 'think' : 'happy', [
    { label: 'Partie analysieren', primary: true, onClick: () => openReview(saveGame()) },
    { label: 'Neue Partie', onClick: openNewDialog },
  ], mine ? null : 'bounce');
  renderPlay(); saveGame(); renderClock();
}
if (!clockTimer) clockTimer = setInterval(clockTick, 200);

function newGame({ color, level, fen }) {
  const chess = new Chess(fen || undefined);
  G = { chess, userColor: color, level, moves: [], over: false, busy: false, hintStep: 0, hint: null, prev: null, takebacks: 0, id: Date.now() };
  if (!fen && settings.tcM > 0) G.clock = { w: settings.tcM * 60000, b: settings.tcM * 60000, inc: settings.tcInc * 1000, run: null, t0: 0 };
}

function renderPlay() {
  if (!G) return;
  const last = G.moves.length ? G.moves[G.moves.length - 1] : null;
  board.set(G.chess, {
    orientation: G.userColor, last: last ? { from: last.from, to: last.to } : null,
    interactive: !G.busy && !G.over ? G.userColor : null, hint: G.hint, showLegal: settings.showLegal,
  });
  // Statuszeile
  let s;
  if (G.over) s = '<b>Partie beendet</b>';
  else if (G.awaiting) s = '<b>Dein Zug wurde bewertet</b> – wie geht es weiter?';
  else if (G.busy) s = `${LEVELS[G.level].name} denkt …`;
  else s = `<b>Du bist am Zug</b> (${whoName(G.userColor)})`;
  if (!G.over && G.chess.inCheck()) s += ' – <b>Schach!</b>';
  if (G.practice) s = 'Übung (ungewertet) · ' + s;
  $('#status').innerHTML = s;
  renderClock();
  // Zugleiste
  let h = '';
  G.moves.forEach((m, i) => {
    if (m.by === 'w') h += `<span class="num">${Math.floor(i / 2) + 1}.</span>`;
    else if (i === 0) h += `<span class="num">1…</span>`;
    const cls = m.cls && m.by === G.userColor ? CLASSES[m.cls] : null;
    h += `<span>${m.san}${cls ? `<b class="mk" style="color:${cls.color}">${cls.sym}</b>` : ''}</span>`;
  });
  const strip = $('#movestrip');
  strip.innerHTML = h;
  strip.scrollLeft = strip.scrollWidth;
}

function prefetch() {
  G.prev = ana(G.chess.fen(), { movetime: 700, multipv: 3 });
}

async function startGame(opts) {
  const color = opts.color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : opts.color;
  newGame({ color, level: opts.level });
  const lv = LEVELS[opts.level];
  coach.say(TN().start(settings.coachName, `${lv.name} (${lv.elo} Elo)`, whoName(color)), 'happy', [], 'nod');
  if (!engineOK) coach.say('Die Engine konnte nicht geladen werden. Du kannst spielen, aber ohne Zugbewertung.', 'worry');
  renderPlay();
  clockStart('w');
  if (color === 'b') await botTurn(); else { prefetch(); renderPlay(); }
}

async function botChoose() {
  const lv = LEVELS[G.level];
  const legal = G.chess.moves({ verbose: true });
  if (lv.uci) {
    const rr = await ana(G.chess.fen(), { elo: lv.num, movetime: 700 });
    if (rr && rr.best && rr.best !== '(none)') return uciParts(rr.best);
  }
  const r = await ana(G.chess.fen(), { depth: lv.depth, multipv: lv.multipv });
  if (!r || !r.lines.length) return legal[Math.floor(Math.random() * legal.length)];
  const lines = r.lines;
  const max = Math.max(...lines.map((l) => l.score));
  const w = lines.map((l) => Math.exp((Math.max(-1500, l.score) - Math.max(-1500, max)) / lv.temp));
  let x = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
  while (i < w.length - 1 && x > w[i]) { x -= w[i]; i++; }
  const u = uciParts(lines[i].pv[0]);
  return u;
}

async function botTurn() {
  if (G.over) return;
  G.busy = true;
  if (G.clock && G.clock.run !== (G.userColor === 'w' ? 'b' : 'w')) clockStart(G.userColor === 'w' ? 'b' : 'w');
  else if (G.clock) G.clock.t0 = Date.now();
  renderPlay();
  const t0 = Date.now();
  const pickMove = await botChoose();
  await sleep(Math.max(0, 600 - (Date.now() - t0)));
  if (G.over) return;
  const mv = G.chess.move({ from: pickMove.from, to: pickMove.to, promotion: pickMove.promotion });
  G.moves.push(recFrom(mv));
  if (G.clock) clockMove(G.userColor === 'w' ? 'b' : 'w', (800 + Math.random() * 1800) * Math.min(3, Math.max(1, G.clock.w / 180000)));
  if (await finishIfOver()) return;
  prefetch();
  G.busy = false; renderPlay();
  if (cmode() !== 'live') { /* stiller Modus: keine Hinweise zum Gegnerzug */ }
  else if (!G.over && weakPieces(G.chess, G.userColor).length && !G.chess.inCheck()) {
    coach.say(`Dein Gegner spielt ${mv.san}. Denk nach: Was will er damit? Droht dir etwas?`, 'think');
  } else if (G.chess.inCheck()) {
    coach.say('Schach! Welche Möglichkeiten hast du: wegziehen, dazwischenstellen oder den Angreifer schlagen?', 'think');
  }
}

async function onUserMove(from, to, promotion) {
  if (!G || G.busy || G.over) return;
  G.busy = true; G.hint = null; G.hintStep = 0;
  const prevPromise = G.prev;
  const mv = G.chess.move({ from, to, promotion });
  const rec = recFrom(mv);
  G.moves.push(rec);
  clockMove(G.userColor);
  if (G.clock) G.clock.run = null; // Bot-Uhr startet erst, wenn der Bot wirklich dran ist
  renderPlay();
  if (G.chess.isGameOver()) { rec.cls = 'best'; await finishIfOver(); return; }
  if (cmode() === 'spaeter') { await botTurn(); return; } // stiller Modus: erst nach der Partie analysieren
  if (cmode() !== 'fehler') coach.say('Mal sehen …', 'think');
  const prevRes = prevPromise ? await prevPromise : null;
  const fb = await evaluateMove(prevRes, rec);
  if (G.over) return;
  if (!fb) { await botTurn(); return; }
  rec.cls = fb.cls.id; rec.loss = fb.loss;
  G.pending = { rec, fb };
  renderPlay();
  const [mood, eff] = MOOD_FOR[fb.cls.id];
  const id = fb.cls.id;
  if (cmode() === 'fehler' && (id === 'best' || id === 'good' || id === 'inacc')) { await botTurn(); return; }
  if (id === 'best' || id === 'good') {
    coach.say(pick(praise(id)), mood, [], eff);
    await sleep(900); await botTurn();
  } else if (id === 'inacc') {
    const ex = explainMove({ fenBefore: rec.fenBefore, played: rec.uci, bestUci: fb.bestUci, replyUci: fb.reply, cls: fb.cls });
    coach.say(`${pick(praise('inacc'))}\n${ex.text}`, mood, [], eff);
    await sleep(900); await botTurn();
  } else {
    askAfterMistake(rec, fb);
  }
}

function askAfterMistake(rec, fb) {
  const ex = explainMove({ fenBefore: rec.fenBefore, played: rec.uci, bestUci: fb.bestUci, replyUci: fb.reply, cls: fb.cls });
  const [mood, eff] = MOOD_FOR[fb.cls.id];
  G.awaiting = true; renderPlay();
  const cont = () => { G.awaiting = false; G.hint = null; coach.clearActions(); botTurn(); };
  const takeBack = () => {
    G.chess.undo(); G.moves.pop(); G.takebacks++; G.busy = false; G.awaiting = false; G.hint = null;
    clockStart(G.userColor);
    renderPlay();
    coach.say('Gut, neuer Versuch. Nimm dir die Frage zu Herzen und prüfe alle Kandidatenzüge.', 'happy');
  };
  const showBetter = () => {
    const { from, to } = uciParts(fb.bestUci);
    G.hint = { arrow: { from, to } }; renderPlay();
    coach.say(`Besser wäre ${uciToSan(rec.fenBefore, fb.bestUci)} gewesen. Überlege, warum.`, 'think', [
      { label: 'Zug zurücknehmen', primary: true, onClick: takeBack }, { label: 'Weiterspielen', onClick: cont },
    ]);
  };
  const explain = () => {
    const actions = [
      { label: 'Zug zurücknehmen', primary: true, onClick: takeBack },
      { label: 'Besseren Zug zeigen', onClick: showBetter },
      { label: 'Weiterspielen', onClick: cont },
    ];
    if (settings.apiKey) actions.splice(2, 0, { label: 'Gemini: Tiefenanalyse', onClick: async () => {
      coach.say('Ich denke kurz nach …', 'think');
      try { coach.say(cleanAI(await askGemini(settings, moveExplainPrompt(geminiData(rec, fb)))), 'happy', actions); }
      catch (e) { coach.say('Gemini-Fehler: ' + e.message, 'worry', actions); }
    } });
    coach.say(`${fb.cls.label}. ${badOpen(fb.cls.id)}${ex.text}`, mood, actions);
  };
  if (!settings.retryOffer && !G.practice) {
    coach.say(`${fb.cls.label}. ${badOpen(fb.cls.id)}${ex.text}`, mood, [], eff);
    sleep(1200).then(cont);
    return;
  }
  coach.say(`${fb.cls.label} (${fb.cls.sym}). ${badOpen(fb.cls.id)}${ex.question}`, mood, [
    { label: 'Zug zurücknehmen', primary: true, onClick: takeBack },
    { label: 'Erklär mir warum', onClick: explain },
    { label: 'Weiterspielen', onClick: cont },
  ], eff);
}

const cmode = () => (G && G.practice ? 'live' : settings.coachMode);
function endButtons() {
  if (G.practice) return [
    { label: 'Zurück zur Analyse', primary: true, onClick: () => switchView('review') },
    { label: 'Nochmal ab hier', onClick: () => startPractice(G.practice) },
    { label: 'Neue Partie', onClick: openNewDialog },
  ];
  return [
    { label: 'Partie analysieren', primary: true, onClick: () => openReview(saveGame()) },
    { label: 'Neue Partie', onClick: openNewDialog },
  ];
}

// Übungsmodus: ab einer Stellung aus der Analyse weiterspielen – ungewertet, mit Hilfe
async function startPractice(p) {
  if (new Chess(p.fen).isGameOver()) { coachReview.say('Hier ist die Partie schon zu Ende. Such dir eine frühere Stellung aus.', 'think'); return; }
  newGame({ color: p.color, level: R ? R.h.level : settings.level, fen: p.fen });
  G.practice = p; G.rated = true;
  switchView('play');
  coach.say('Übungsmodus: Diese Partie zählt nicht für deine Elo. Ich kommentiere jeden Zug, der Tipp und die Denk-Routine helfen dir, und Fehler darfst du zurücknehmen. Finde den besseren Weg!', 'happy', [], 'nod');
  renderPlay();
  if (G.chess.turn() !== p.color) await botTurn(); else { prefetch(); renderPlay(); }
}

async function finishIfOver() {
  const c = G.chess;
  if (!c.isGameOver()) return false;
  G.over = true; G.busy = false;
  let result, text, mood = 'neutral', eff = null;
  if (c.isCheckmate()) {
    const winner = c.turn() === 'w' ? 'b' : 'w';
    if (winner === G.userColor) { result = 'win'; text = TN().end.win; mood = 'happy'; eff = 'bounce'; }
    else { result = 'loss'; text = TN().end.loss; mood = 'think'; }
  } else {
    result = 'draw';
    text = (c.isStalemate() ? 'Patt. ' : '') + TN().end.draw;
  }
  G.result = result;
  if (!G.rated) { G.rated = true; text += '\n' + ratingLine(updateRating(result, LEVELS[G.level].num, G.takebacks)); }
  coach.say(text, mood, endButtons(), eff);
  renderPlay();
  saveGame();
  return true;
}

function saveGame() {
  if (G.practice) return null; // Übungspartien werden nicht gespeichert
  const hist = store.get('history', []);
  let item = hist.find((h) => h.id === G.id);
  if (!item) {
    item = { id: G.id, date: Date.now(), userColor: G.userColor, level: G.level, result: G.result || 'abandoned', ucis: G.moves.map((m) => m.uci), takebacks: G.takebacks };
    hist.unshift(item);
  } else { item.result = G.result || item.result; item.ucis = G.moves.map((m) => m.uci); }
  store.set('history', hist.slice(0, 15));
  return item;
}

$('#btn-hint').onclick = async () => {
  if (!G || G.over || G.busy) return;
  const res = G.prev ? await G.prev : null;
  const h = hintFor(G.chess, res && res.lines[0] ? res.lines[0].pv[0] : null, Math.min(G.hintStep, 3));
  G.hintStep++;
  G.hint = { highlight: h.highlight, arrow: h.arrow };
  coach.say(h.text, 'think');
  renderPlay();
};
$('#btn-check').onclick = () => $('#dlg-check').showModal();
$('#check-close').onclick = () => $('#dlg-check').close();
$('#btn-resign').onclick = () => {
  if (!G || G.over) return;
  coach.say('Willst du wirklich aufgeben?', 'think', [
    { label: 'Ja, aufgeben', onClick: () => { G.over = true; G.busy = false; G.result = 'loss'; const u = G.rated ? null : updateRating('loss', LEVELS[G.level].num, G.takebacks); G.rated = true; saveGame(); renderPlay(); coach.say('Kein Problem. Schauen wir uns an, wo es kippte?' + (u ? '\n' + ratingLine(u) : ''), 'neutral', endButtons()); } },
    { label: 'Weiterspielen', onClick: () => coach.say('Gut, weiter geht es!', 'happy') },
  ]);
};

/* ---------- Knöpfe-Seitenleiste bei knappem Platz ---------- */
function updateCtl() {
  const pip = document.body.dataset.layout === 'pip';
  const pipH = pip ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pip-h')) || 26) : 0;
  const avail = window.innerHeight * (1 - pipH / 100);
  const mode = pip && avail - 300 < window.innerWidth * 0.95 ? 'drawer' : 'bar';
  if (document.body.dataset.ctl !== mode) document.body.dataset.ctl = mode;
  if (mode === 'bar') setCtl(false);
}
function setCtl(open) {
  $('.controls').classList.toggle('open', open);
  $('#ctl-tab').textContent = open ? '›' : '‹';
}
$('#ctl-tab').onclick = () => setCtl(!$('.controls').classList.contains('open'));
$('.controls').addEventListener('click', (e) => { if (e.target.closest('.btn')) setCtl(false); });
$('#board').addEventListener('pointerdown', () => setCtl(false));
window.addEventListener('resize', updateCtl);
document.addEventListener('pipchange', updateCtl);
setInterval(updateCtl, 800);
updateCtl();

/* ---------- Neue-Partie-Dialog ---------- */
const dlgNew = $('#dlg-new');
function openNewDialog() {
  const range = $('#elo-range');
  range.value = levelInfo(settings.level).num;
  { const R = getRating(); $('#elo-mine').textContent = `Deine geschätzte Elo: ca. ${R.r}${R.n < 10 ? ' (vorläufig)' : ''}. Ein Gegner nahe an deinem Wert ist meist am lehrreichsten.`; }
  const upd = () => {
    const lv = levelInfo(+range.value);
    settings.level = lv.num;
    $('#elo-num').textContent = lv.num;
    $('#elo-name').textContent = lv.name + (lv.num >= 2800 ? ' · zum Vergleich: Magnus Carlsen ca. 2823 (FIDE, Nov. 2026)' : '');
  };
  range.oninput = upd; upd();
  const stc = $('#seg-tc'), cm = $('#tc-m'), ci = $('#tc-inc');
  stc.innerHTML = TC_PRESETS.map(([m, i, n]) => `<button data-m="${m}" data-i="${i}">${n}</button>`).join('');
  const markTc = () => stc.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.m === settings.tcM && +b.dataset.i === settings.tcInc));
  cm.value = settings.tcM; ci.value = settings.tcInc; markTc();
  stc.querySelectorAll('button').forEach((b) => { b.onclick = () => { settings.tcM = +b.dataset.m; settings.tcInc = +b.dataset.i; cm.value = settings.tcM; ci.value = settings.tcInc; markTc(); }; });
  const custom = () => { settings.tcM = Math.max(0, Math.min(180, Math.round(+cm.value || 0))); settings.tcInc = Math.max(0, Math.min(60, Math.round(+ci.value || 0))); markTc(); };
  cm.oninput = custom; ci.oninput = custom;
  const sc = $('#seg-color');
  sc.querySelectorAll('button').forEach((b) => { b.classList.toggle('on', b.dataset.v === settings.color); b.onclick = () => { settings.color = b.dataset.v; sc.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); }; });
  switchView('play');
  dlgNew.showModal();
}
$('#btn-new').onclick = openNewDialog;
$('#new-cancel').onclick = () => dlgNew.close();
$('#new-start').onclick = () => { saveSettings(); dlgNew.close(); startGame({ color: settings.color, level: settings.level }); };

/* =====================================================================
   ANALYSE (Review)
   ===================================================================== */
let R = null;
const cache = new Map();

function rebuild(h) {
  const c = new Chess();
  const moves = [];
  for (const u of h.ucis) {
    try { moves.push(recFrom(c.move(uciParts(u)))); } catch { break; }
  }
  return { moves, startFen: new Chess().fen() };
}

function renderHistory() {
  const hist = store.get('history', []);
  const el = $('#history');
  if (!hist.length) { el.innerHTML = '<p class="note">Noch keine Partien gespeichert.</p>'; return; }
  const res = { win: 'Sieg', loss: 'Niederlage', draw: 'Remis', abandoned: 'Abgebrochen' };
  el.innerHTML = hist.map((h) => `<div class="hist" data-id="${h.id}"><div><b>${res[h.result] || '?'}</b> gegen ${LEVELS[h.level]?.name || 'Bot'}<small>${new Date(h.date).toLocaleString('de-DE')} · ${h.ucis.length} Halbzüge · ${whoName(h.userColor)}</small></div><span>›</span></div>`).join('');
  el.querySelectorAll('.hist').forEach((n) => n.onclick = () => openReview(hist.find((h) => h.id === +n.dataset.id)));
}

async function analyzePos(fen) {
  const c = new Chess(fen);
  if (c.isCheckmate()) return { lines: [{ score: -10000, pv: [] }], terminal: true };
  if (c.isGameOver()) return { lines: [{ score: 0, pv: [] }], terminal: true };
  const key = fen + '|r';
  if (cache.has(key)) return cache.get(key);
  const r = await ana(fen, { movetime: 300, multipv: 2 });
  if (r) cache.set(key, r);
  return r;
}

async function openReview(h) {
  switchView('review');
  $('#review-empty').hidden = true; $('#review-main').hidden = false;
  const { moves } = rebuild(h);
  R = { h, moves, pos: [], data: [], idx: 0, sub: 1 };
  const bar = $('#review-progress'), fill = bar.firstElementChild;
  bar.hidden = false; fill.style.width = '0%';
  coachReview.say('Ich gehe die Partie Zug für Zug durch. Das dauert einen Moment …', 'think');
  const fens = [new Chess().fen(), ...moves.map((m) => m.fenAfter)];
  for (let i = 0; i < fens.length; i++) {
    const r = await analyzePos(fens[i]);
    if (!r) { bar.hidden = true; coachReview.say('Die Engine ist nicht verfügbar, daher kann ich die Partie nicht analysieren.', 'worry'); return; }
    R.pos.push(r);
    fill.style.width = Math.round(((i + 1) / fens.length) * 100) + '%';
  }
  bar.hidden = true;
  computeReview();
  R.idx = firstCritical(0) ?? moves.length;
  R.sub = flawedAt(R.idx) ? 0 : 1;
  renderReview();
}

function computeReview() {
  const { moves, pos, h } = R;
  R.data = moves.map((m, i) => {
    const before = pos[i].lines[0];
    let value;
    const line = pos[i].lines.find((l) => l.pv[0] === m.uci);
    if (pos[i + 1].terminal) value = -pos[i + 1].lines[0].score;
    else if (line) value = line.score;
    else value = -pos[i + 1].lines[0].score;
    const loss = Math.max(0, winPct(before.score) - winPct(value));
    const bestUci = before.pv[0];
    return {
      cls: classify(loss, m.uci === bestUci), loss, bestUci, pv: before.pv, bestScore: before.score, value,
      reply: pos[i + 1].lines[0] && pos[i + 1].lines[0].pv[0], accuracy: moveAccuracy(winPct(before.score), winPct(value)),
    };
  });
  // Statistik für den Spieler
  const mine = moves.map((m, i) => ({ m, d: R.data[i] })).filter((x) => x.m.by === h.userColor);
  R.accuracy = mine.length ? Math.round(mine.reduce((a, x) => a + x.d.accuracy, 0) / mine.length) : 0;
  R.counts = { best: 0, good: 0, inacc: 0, mistake: 0, blunder: 0 };
  mine.forEach((x) => R.counts[x.d.cls.id]++);
  // Aufgaben aus eigenen Fehlern speichern
  const mistakes = store.get('mistakes', []);
  for (const x of mine) {
    if ((x.d.cls.id === 'mistake' || x.d.cls.id === 'blunder') && x.d.bestUci && !mistakes.some((t) => t.fen === x.m.fenBefore)) {
      mistakes.unshift({ fen: x.m.fenBefore, best: x.d.bestUci, played: x.m.uci, cls: x.d.cls.id, date: Date.now() });
    }
  }
  store.set('mistakes', mistakes.slice(0, 100));
}

const isCritical = (i) => R.moves[i].by === R.h.userColor && ['mistake', 'blunder'].includes(R.data[i].cls.id);
const isFlawed = (i) => R.moves[i].by === R.h.userColor && ['inacc', 'mistake', 'blunder'].includes(R.data[i].cls.id);
const flawedAt = (i) => i >= 1 && isFlawed(i - 1); // i = Anzahl gespielter Halbzüge
function firstCritical(from) { for (let i = from; i < R.moves.length; i++) if (isCritical(i)) return i + 1; return null; }

function renderReview() {
  const { moves, data, idx, h } = R;
  const c = new Chess();
  moves.slice(0, idx).forEach((m) => c.move(uciParts(m.uci)));
  const last = idx > 0 ? { from: moves[idx - 1].from, to: moves[idx - 1].to } : null;
  const before = idx > 0 && R.sub === 0; // Stellung VOR dem Zug mit Pfeilen zeigen
  if (before) {
    const m = moves[idx - 1], d = data[idx - 1];
    const arrows = [];
    if (d.bestUci) { const u = uciParts(d.bestUci); arrows.push({ from: u.from, to: u.to, color: '#35c98a' }); }
    if (d.bestUci !== m.uci) { const pu = uciParts(m.uci); arrows.push({ from: pu.from, to: pu.to, color: '#e5484d' }); }
    boardReview.set(new Chess(m.fenBefore), { orientation: h.userColor, last: null, interactive: null, hint: { arrows }, showLegal: false });
  } else {
    boardReview.set(c, { orientation: h.userColor, last, interactive: null, hint: null, showLegal: false });
  }
  // Kommentar
  if (idx === 0) coachReview.say('Das ist die Ausgangsstellung. Tippe auf einen Zug unten oder auf „Nächster Fehler“.', 'neutral');
  else {
    const m = moves[idx - 1], d = data[idx - 1];
    const mine = m.by === h.userColor;
    let t = `${Math.ceil(idx / 2)}${m.by === 'w' ? '.' : '…'} ${m.san} – ${d.cls.label} ${d.cls.sym}`;
    let mood = MOOD_FOR[d.cls.id][0];
    if (['mistake', 'blunder', 'inacc'].includes(d.cls.id)) {
      const ex = explainMove({ fenBefore: m.fenBefore, played: m.uci, bestUci: d.bestUci, replyUci: d.reply, cls: d.cls });
      t += `\n${ex.text}`;
      if (mine && ex.question) t += `\n${ex.question}`;
      t += `\nBesser: ${uciToSan(m.fenBefore, d.bestUci)}${before ? ' (grüner Pfeil; rot = dein Zug)' : ''}`;
      const bl = R.pos[idx - 1].lines[0];
      if (mine && bl && bl.mate > 0) t += `\nHier war ein Matt in ${bl.mate} möglich!`;
      if (!mine && ['mistake', 'blunder'].includes(d.cls.id)) { t = `Der Bot patzt hier: ${t}`; mood = 'happy'; }
    } else if (!mine) { mood = 'neutral'; }
    const acts = before && mine && ['mistake', 'blunder'].includes(d.cls.id) ? [{ label: 'Ab hier üben', primary: true, onClick: practiceHere }] : [];
    coachReview.say(t, mine ? mood : (mood === 'wow' ? 'think' : mood), acts);
  }
  $('#review-summary').innerHTML = `Genauigkeit <b>${R.accuracy}%</b> · Patzer <b>${R.counts.blunder}</b> · Fehler <b>${R.counts.mistake}</b> · Ungenauigkeiten <b>${R.counts.inacc}</b>`;
  drawGraph();
  let ml = '';
  moves.forEach((m, i) => {
    if (m.by === 'w') ml += `<span class="num">${Math.floor(i / 2) + 1}.</span>`;
    const cls = data[i].cls;
    ml += `<button data-i="${i + 1}" class="${idx === i + 1 ? 'cur' : ''}">${m.san}<b class="mk" style="color:${cls.color}">${['best', 'good'].includes(cls.id) ? '' : cls.sym}</b></button>`;
  });
  const box = $('#rv-moves');
  box.innerHTML = ml;
  box.querySelectorAll('button').forEach((b) => b.onclick = () => go(+b.dataset.i));
  const cur = box.querySelector('.cur');
  if (cur) box.scrollLeft = cur.offsetLeft - box.clientWidth / 2 + cur.clientWidth / 2;
}

function drawGraph() {
  const n = R.pos.length;
  const pts = R.pos.map((p, i) => {
    const stm = new Chess(i === 0 ? undefined : R.moves[i - 1].fenAfter).turn();
    const s = p.lines[0].score * (stm === 'w' ? 1 : -1);
    const y = 50 - (winPct(s) / 100) * 50;
    const x = n > 1 ? (i / (n - 1)) * 300 : 0;
    return [x, y];
  });
  const poly = pts.map((p) => p.join(',')).join(' ');
  const cur = pts[R.idx];
  const dots = R.moves.map((m, i) => (['mistake', 'blunder'].includes(R.data[i].cls.id) && m.by === R.h.userColor) ? `<circle cx="${pts[i + 1][0]}" cy="${pts[i + 1][1]}" r="2.2" fill="${R.data[i].cls.color}"/>` : '').join('');
  $('#graph').innerHTML = `<rect x="0" y="0" width="300" height="25" fill="#fff" opacity=".07"/><line x1="0" y1="25" x2="300" y2="25" stroke="#fff" opacity=".25" stroke-width=".5"/>
    <polyline points="${poly}" fill="none" stroke="#4f8cff" stroke-width="1.4" vector-effect="non-scaling-stroke"/>${dots}
    <line x1="${cur[0]}" y1="0" x2="${cur[0]}" y2="50" stroke="#fff" stroke-width=".8" opacity=".8"/>`;
}
$('#graph').onclick = (e) => {
  if (!R) return;
  const r = e.currentTarget.getBoundingClientRect();
  go(Math.round(((e.clientX - r.left) / r.width) * (R.pos.length - 1)));
};
const go = (i) => { if (!R) return; R.idx = Math.max(0, Math.min(R.moves.length, i)); R.sub = flawedAt(R.idx) ? 0 : 1; renderReview(); };
// Schritt vor/zurück: bei eigenen Fehlern erst die Stellung vor dem Zug (mit Pfeilen), dann nach dem Zug
function step(dir) {
  if (!R) return;
  if (dir > 0) {
    if (R.idx >= R.moves.length && R.sub === 1) return;
    if (R.idx > 0 && R.sub === 0) R.sub = 1;
    else { R.idx++; R.sub = flawedAt(R.idx) ? 0 : 1; }
  } else if (R.idx > 0 && R.sub === 1 && flawedAt(R.idx)) R.sub = 0;
  else if (R.idx > 0) { R.idx--; R.sub = 1; }
  renderReview();
}
function practiceHere() {
  if (!R) return;
  const m = R.idx > 0 ? R.moves[R.idx - 1] : null;
  const fen = !m ? new Chess().fen() : (R.sub === 0 ? m.fenBefore : m.fenAfter);
  startPractice({ fen, color: R.h.userColor });
}
$('#rv-first').onclick = () => go(0);
$('#rv-prev').onclick = () => step(-1);
$('#rv-next').onclick = () => step(1);
$('#rv-practice').onclick = practiceHere;
$('#rv-last').onclick = () => go(R.moves.length);
$('#rv-crit').onclick = () => { const n = firstCritical(R.idx) ?? firstCritical(0); if (n) go(n); else coachReview.say('Du hast keine Fehler oder Patzer gemacht – stark!', 'happy', [], 'bounce'); };
$('#rv-best').onclick = () => { if (!R || R.idx === 0) return; R.sub = R.sub === 0 ? 1 : 0; renderReview(); };
$('#rv-back').onclick = () => { $('#review-main').hidden = true; $('#review-empty').hidden = false; renderHistory(); };
$('#rv-gem').onclick = async () => {
  if (!R || R.idx === 0) return;
  if (!settings.apiKey) { coachReview.say('Dafür brauche ich deinen Gemini-API-Key (Reiter „Mehr“).', 'think'); return; }
  const m = R.moves[R.idx - 1], d = R.data[R.idx - 1];
  coachReview.say('Ich denke kurz nach …', 'think');
  try { coachReview.say(cleanAI(await askGemini(settings, moveExplainPrompt(geminiData(m, d)))), 'happy'); }
  catch (e) { coachReview.say('Gemini-Fehler: ' + e.message, 'worry'); }
};
$('#rv-gem-all').onclick = async () => {
  if (!R) return;
  if (!settings.apiKey) { coachReview.say('Dafür brauche ich deinen Gemini-API-Key (Reiter „Mehr“).', 'think'); return; }
  const critical = R.moves.map((m, i) => ({ m, d: R.data[i], i })).filter((x) => isCritical(x.i))
    .map((x) => `${Math.floor(x.i / 2) + 1}. ${x.m.san} (${x.d.cls.label}, besser: ${uciToSan(x.m.fenBefore, x.d.bestUci)})`);
  const res = { win: 'Sieg', loss: 'Niederlage', draw: 'Remis' }[R.h.result] || 'unbekannt';
  coachReview.say('Ich fasse die Partie zusammen …', 'think');
  try {
    coachReview.say(cleanAI(await askGemini(settings, gameSummaryPrompt({
      color: whoName(R.h.userColor), level: LEVELS[R.h.level]?.name, result: res, accuracy: R.accuracy,
      counts: `Patzer ${R.counts.blunder}, Fehler ${R.counts.mistake}, Ungenauigkeiten ${R.counts.inacc}`, critical,
    }))), 'happy');
  } catch (e) { coachReview.say('Gemini-Fehler: ' + e.message, 'worry'); }
};

/* =====================================================================
   AUFGABEN (aus eigenen Fehlern)
   ===================================================================== */
let T = null;
function enterTrain() {
  const n = store.get('mistakes', []).length;
  if (!T) {
    boardTrain.set(new Chess(), { orientation: 'w', interactive: null, last: null, hint: null });
    $('#train-info').textContent = n ? `${n} Aufgabe(n) aus deinen Partien warten` : 'Noch keine Aufgaben';
    coachTrain.say(n ? 'Hier üben wir die Stellungen, in denen du einen Fehler gemacht hast. Bereit?' : 'Sobald du eine Partie analysieren lässt, sammle ich deine Fehler hier als Aufgaben.', 'neutral');
  }
}
function startTask(skipId) {
  const list = store.get('mistakes', []);
  if (!list.length) { T = null; enterTrain(); return; }
  const cand = list.filter((t) => t.fen !== skipId);
  const item = (cand.length ? cand : list)[Math.floor(Math.random() * (cand.length || list.length))];
  const chess = new Chess(item.fen);
  T = { item, chess, tries: 0, hintStep: 0, res: ana(item.fen, { movetime: 700, multipv: 3 }), done: false, busy: false };
  boardTrain.set(chess, { orientation: chess.turn(), interactive: chess.turn(), last: null, hint: null, showLegal: settings.showLegal });
  $('#train-info').innerHTML = `<b>${whoName(chess.turn())}</b> ist am Zug – finde einen guten Zug`;
  coachTrain.say('In dieser Stellung hast du dich in einer Partie vertan. Geh die Denk-Routine durch: Was droht? Was hängt? Dann zieh.', 'think');
}
async function onTrainMove(from, to, promotion) {
  if (!T || T.busy || T.done) return;
  T.busy = true;
  const fenBefore = T.chess.fen();
  const mv = T.chess.move({ from, to, promotion });
  const rec = recFrom(mv);
  boardTrain.set(T.chess, { last: { from, to }, interactive: null, hint: null });
  coachTrain.say('Mal sehen …', 'think');
  const res = await T.res;
  const fb = await evaluateMove(res, rec);
  if (!fb) { T.busy = false; coachTrain.say('Keine Engine-Daten – versuche es später nochmal.', 'worry'); return; }
  if (fb.loss <= 5) {
    T.done = true;
    const list = store.get('mistakes', []).filter((t) => t.fen !== T.item.fen);
    store.set('mistakes', list);
    coachTrain.say(`${pick(praise(fb.cls.id === 'best' ? 'best' : 'good'))} Aufgabe gelöst (${list.length} übrig).`, 'happy', [{ label: 'Nächste Aufgabe', primary: true, onClick: () => startTask() }], 'bounce');
    T.busy = false;
    return;
  }
  T.tries++;
  const ex = explainMove({ fenBefore, played: rec.uci, bestUci: fb.bestUci, replyUci: fb.reply, cls: fb.cls });
  T.chess.undo();
  T.busy = false;
  let hint = null, extra = '';
  if (T.tries >= 3) { const u = uciParts(fb.bestUci); hint = { arrow: { from: u.from, to: u.to } }; extra = `\nDie Lösung ist ${uciToSan(fenBefore, fb.bestUci)}.`; }
  boardTrain.set(T.chess, { last: null, interactive: T.chess.turn(), hint });
  coachTrain.say(`${fb.cls.label}. ${T.tries < 2 ? ex.question : ex.text}${extra}`, T.tries >= 3 ? 'think' : 'worry', [], 'shake');
}
$('#btn-train-next').onclick = () => startTask();
$('#btn-train-skip').onclick = () => startTask(T && T.item.fen);
$('#btn-train-hint').onclick = async () => {
  if (!T || T.done) return;
  const res = await T.res;
  const h = hintFor(T.chess, res && res.lines[0] ? res.lines[0].pv[0] : null, Math.min(T.hintStep, 3));
  T.hintStep++;
  boardTrain.set(T.chess, { hint: { highlight: h.highlight, arrow: h.arrow }, interactive: T.chess.turn() });
  coachTrain.say(h.text, 'think');
};

/* =====================================================================
   EINSTELLUNGEN
   ===================================================================== */
initLookSettings($('#look-box'), settings, saveSettings, (k) => {
  if (k === 'avatar') {
    [coach, coachTrain, coachReview].forEach((c) => c.setAvatar(settings.avatar));
    settings.coachName = coachName(settings.avatar); saveSettings();
    coach.say(`Hallo, ich bin ${settings.coachName}, dein Schach-Coach! Ab jetzt schaue ich dir über die Schulter.`, 'happy', [], 'nod');
  }
  [board, boardTrain, boardReview].forEach((b) => b.render());
});
const toneSel = $('#set-tone');
toneSel.innerHTML = Object.entries(TONES).map(([k, t]) => `<option value="${k}">${t.name} – ${t.desc}</option>`).join('');
toneSel.value = TONES[settings.tone] ? settings.tone : 'freundlich';
toneSel.onchange = () => { settings.tone = toneSel.value; saveSettings(); coach.say(TN().sample, 'happy', [], 'nod'); };
$('#set-rating-reset').onclick = () => { store.set('rating', { r: RATING_START, n: 0, hist: [] }); renderRating(); $('#set-msg').textContent = 'Elo-Schätzung zurückgesetzt.'; };
const modeSel = $('#set-mode');
const MODE_TEXT = { live: 'Ich kommentiere jeden deiner Züge.', fehler: 'Ich melde mich nur noch bei Fehlern und Patzern.', spaeter: 'Ich schweige während der Partie. Danach gehen wir alles in der Analyse durch.' };
modeSel.value = MODE_TEXT[settings.coachMode] ? settings.coachMode : 'live';
modeSel.onchange = () => { settings.coachMode = modeSel.value; saveSettings(); coach.say(MODE_TEXT[settings.coachMode], 'happy', [], 'nod'); };
$('#set-key').value = settings.apiKey;
$('#set-model').value = settings.model;
$('#set-legal').checked = settings.showLegal;
$('#set-retry').checked = settings.retryOffer;
$('#set-key').onchange = (e) => { settings.apiKey = e.target.value.trim(); saveSettings(); };
$('#set-model').onchange = (e) => { settings.model = e.target.value.trim() || 'gemini-flash-latest'; saveSettings(); };
$('#set-legal').onchange = (e) => { settings.showLegal = e.target.checked; saveSettings(); };
$('#set-retry').onchange = (e) => { settings.retryOffer = e.target.checked; saveSettings(); };
$('#set-test').onclick = async () => {
  const msg = $('#set-msg');
  msg.textContent = 'Teste …';
  try { msg.textContent = 'Gemini antwortet: ' + (await askGemini(settings, 'Sag in einem kurzen Satz Hallo als Schach-Coach.')).slice(0, 200); }
  catch (e) { msg.textContent = 'Fehler: ' + e.message; }
};
$('#set-clear').onclick = () => {
  store.set('history', []); store.set('mistakes', []);
  $('#set-msg').textContent = 'Gelöscht.';
};

/* ---------- Start ---------- */
coach.say(`Hallo, ich bin ${settings.coachName}, dein Schach-Coach! Wir üben das Denken am Brett: Was droht? Was hängt? Starte eine Partie, ich bewerte jeden deiner Züge.`, 'happy', [
  { label: 'Neue Partie', primary: true, onClick: openNewDialog },
], 'nod');
board.set(new Chess(), { orientation: 'w', interactive: null });
$('#status').textContent = 'Bereit';

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
