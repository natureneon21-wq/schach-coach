// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
import { Chess } from './vendor/chess.js';

export const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
export const NAME = { p: 'Bauer', n: 'Springer', b: 'Läufer', r: 'Turm', q: 'Dame', k: 'König' };

export const CLASSES = {
  best:    { id: 'best',    label: 'Bester Zug',    sym: '★',  color: '#35c98a' },
  good:    { id: 'good',    label: 'Guter Zug',     sym: '✓',  color: '#7fc96a' },
  inacc:   { id: 'inacc',   label: 'Ungenauigkeit', sym: '?!', color: '#e8c547' },
  mistake: { id: 'mistake', label: 'Fehler',        sym: '?',  color: '#f08c3a' },
  blunder: { id: 'blunder', label: 'Patzer',        sym: '??', color: '#e5484d' },
};

export const winPct = (cp) => {
  const c = Math.max(-1000, Math.min(1000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
};

/** Verlust in Gewinnwahrscheinlichkeits-Prozentpunkten -> Klasse. */
export function classify(loss, isBest) {
  if (isBest || loss <= 1.5) return CLASSES.best;
  if (loss <= 5) return CLASSES.good;
  if (loss <= 10) return CLASSES.inacc;
  if (loss <= 20) return CLASSES.mistake;
  return CLASSES.blunder;
}

export const moveAccuracy = (winBefore, winAfter) =>
  Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * Math.max(0, winBefore - winAfter)) - 3.1669));

export const uciParts = (u) => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });

/** Wandelt eine UCI-Zugfolge ab fen in SAN um. */
export function pvToSan(fen, pv, max = 4) {
  const c = new Chess(fen);
  const out = [];
  for (const u of pv.slice(0, max)) {
    try { out.push(c.move(uciParts(u)).san); } catch { break; }
  }
  return out;
}

export function uciToSan(fen, uci) {
  try { return new Chess(fen).move(uciParts(uci)).san; } catch { return uci; }
}

/** Ungedeckte oder angreifbare Figuren einer Farbe (ohne König). */
export function weakPieces(chess, color) {
  const opp = color === 'w' ? 'b' : 'w';
  const res = [];
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.color !== color || p.type === 'k') continue;
      const att = chess.attackers(p.square, opp);
      if (!att.length) continue;
      const defenders = chess.attackers(p.square, color).length;
      const attTypes = att.map((s) => chess.get(s).type);
      const nonKing = attTypes.filter((t) => t !== 'k');
      let minAtt = Math.min(...attTypes.map((t) => VALUE[t]));
      if (defenders > 0 && nonKing.length === 0) continue; // nur König greift ein gedecktes Stück an
      if (defenders > 0 && nonKing.length) minAtt = Math.min(...nonKing.map((t) => VALUE[t]));
      if (defenders === 0 || minAtt < VALUE[p.type]) {
        res.push({ square: p.square, type: p.type, defended: defenders > 0 });
      }
    }
  }
  return res.sort((a, b) => VALUE[b.type] - VALUE[a.type]);
}

const art = (t) => ({ p: 'der Bauer', n: 'der Springer', b: 'der Läufer', r: 'der Turm', q: 'die Dame', k: 'der König' }[t]);
const acc = (t) => ({ p: 'den Bauern', n: 'den Springer', b: 'den Läufer', r: 'den Turm', q: 'die Dame', k: 'den König' }[t]);

/**
 * Lokale Erklärung für einen schwachen Zug (ohne KI).
 * ctx: { fenBefore, played (uci), bestUci, replyUci, cls }
 * Liefert { text, question, facts:[] }.
 */
export function explainMove(ctx) {
  const facts = [];
  const self = !!ctx.self; // Der Bot/Coach kommentiert seinen eigenen Zug in der Ich-Form
  let cause = 'plan';
  let text = '';
  const after = new Chess(ctx.fenBefore);
  const mover = after.turn();
  let playedMove;
  try { playedMove = after.move(uciParts(ctx.played)); } catch { return { text: '', question: '', facts }; }

  // 1) Was kann der Gegner direkt gewinnen?
  if (ctx.replyUci) {
    const t = new Chess(after.fen());
    try {
      const r = t.move(uciParts(ctx.replyUci));
      if (t.isCheckmate()) {
        cause = 'mate';
        text = self ? `Nach meinem Zug kannst du mit ${r.san} Matt setzen.` : `Nach deinem Zug kann dein Gegner mit ${r.san} Matt setzen.`;
      } else if (r.captured) {
        cause = 'hang';
        text = self ? `Nach meinem Zug kannst du mit ${r.san} ${acc(r.captured)} schlagen.` : `Nach deinem Zug kann dein Gegner mit ${r.san} ${acc(r.captured)} schlagen.`;
        facts.push(`Gegner-Antwort ${r.san} schlägt ${NAME[r.captured]}`);
      } else if (t.inCheck()) {
        cause = 'check';
        text = self ? `Nach meinem Zug hast du mit ${r.san} eine starke Antwort mit Schach.` : `Nach deinem Zug hat dein Gegner mit ${r.san} eine starke Antwort mit Schach.`;
      }
    } catch { /* ignore */ }
  }

  // 2) Schwache eigene Figuren nach dem Zug
  const weak = weakPieces(after, mover);
  if (weak.length) {
    const w = weak[0];
    facts.push(`${NAME[w.type]} auf ${w.square} ist ${w.defended ? 'zu niedrig gedeckt' : 'ungedeckt'} und angegriffen`);
    if (!text) {
      cause = 'weak';
      text = `${art(w.type)} auf ${w.square} ${w.defended ? 'kann mit Verlust angegriffen werden' : 'steht ungedeckt und wird angegriffen'}.`;
      text = text[0].toUpperCase() + text.slice(1);
    }
  }

  // 3) Was hast du verpasst?
  let missed = '';
  if (ctx.bestUci && ctx.bestUci !== ctx.played) {
    const b = new Chess(ctx.fenBefore);
    try {
      const bm = b.move(uciParts(ctx.bestUci));
      if (b.isCheckmate()) missed = 'Es gab ein Matt in einem Zug.';
      else if (bm.captured) missed = `Es gab eine Gewinnchance: ${acc(bm.captured)} auf ${bm.to} schlagen.`;
      else if (b.inCheck()) missed = 'Es gab einen starken Schachzug.';
      facts.push(`Bester Zug war ${bm.san}`);
    } catch { /* ignore */ }
  }
  if (!text) text = missed || (self ? 'Dieser Zug verschlechtert meine Stellung. Es gab einen deutlich besseren Plan.' : 'Dieser Zug verschlechtert deine Stellung. Es gab einen deutlich besseren Plan.');
  else if (missed) text += ' ' + missed;

  const question = {
    mate: 'Stopp: Welche Schachs hat dein Gegner nach deinem Zug? Schau dir immer zuerst Schachs an.',
    hang: 'Schau noch einmal auf dein Brett: Welche deiner Figuren ist nach diesem Zug angreifbar – und ist sie gedeckt?',
    check: 'Welche Schachs hat dein Gegner nach deinem Zug? Und wohin müsste dein König ziehen?',
    weak: 'Welche deiner Figuren wird nach diesem Zug angegriffen? Wie kannst du sie schützen?',
    plan: 'Was will dein Gegner als Nächstes tun? Und welche deiner Figuren steht gerade am schlechtesten?',
  }[cause];
  return { text, question, facts, cause };
}

/** Schritt-für-Schritt-Hinweise für die aktuelle Stellung (Russian-School: erst Fragen, dann Zeigen). */
export function hintFor(chess, bestUci, step) {
  const me = chess.turn();
  const opp = me === 'w' ? 'b' : 'w';
  const mine = weakPieces(chess, me);
  const theirs = weakPieces(chess, opp);
  if (step === 0) {
    return { text: 'Frag dich: Was hat mein Gegner gerade vor? Welche meiner Figuren sind angegriffen oder ungedeckt?' };
  }
  if (step === 1) {
    if (mine.length) {
      const w = mine[0];
      return { text: `Schau auf ${art(w.type)} auf ${w.square}: Wird sie angegriffen? Ist sie gedeckt?`, highlight: w.square };
    }
    if (theirs.length) {
      const w = theirs[0];
      return { text: `Auch dein Gegner hat Schwächen. Wie steht es um ${art(w.type)} auf ${w.square}?`, highlight: w.square };
    }
    return { text: 'Keine Figur hängt. Suche nach Schachs, Schlagzügen und Drohungen – in dieser Reihenfolge. Sonst: verbessere deine schlechteste Figur.' };
  }
  if (!bestUci) return { text: 'Ich habe gerade keine Engine-Daten für diese Stellung.' };
  if (step === 2) {
    const { from } = uciParts(bestUci);
    const p = chess.get(from);
    return { text: `Denk an ${art(p.type)} auf ${from}. Was kann sie hier Gutes tun?`, highlight: from };
  }
  const { from, to } = uciParts(bestUci);
  return { text: `Ein starker Zug wäre ${uciToSan(chess.fen(), bestUci)}. Überlege, warum er gut ist.`, arrow: { from, to } };
}

export const PRAISE = {
  best: ['Genau das ist der Zug! Sehr gut gesehen.', 'Stark! Das war der beste Zug der Stellung.', 'Perfekt – du hast die Stellung richtig gelesen.'],
  good: ['Guter Zug, der macht Sinn.', 'Solide! Weiter so.', 'Das passt gut zur Stellung.'],
  inacc: ['Spielbar, aber es ging etwas genauer. Prüfe beim nächsten Mal alle Kandidatenzüge.', 'Nicht schlimm, aber da war mehr drin.'],
};
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
