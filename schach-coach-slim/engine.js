// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Dünner Wrapper um Stockfish (WASM, single-thread) mit Job-Warteschlange.
// Alle Scores sind aus Sicht des Spielers am Zug (UCI-Konvention), in Centipawns.
// Matt wird als +/-(10000 - Züge bis Matt) kodiert.

export class Engine {
  constructor(path = 'vendor/stockfish.js') {
    this.path = path;
    this.worker = null;
    this.ready = null;
    this.queue = Promise.resolve();
    this.cur = null;
  }

  // Hinweis: vendor/stockfish.js und .wasm erzeugt die GitHub Action beim Deploy aus dem npm-Paket stockfish (siehe .github/workflows/pages.yml).
  init() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      let w;
      try { w = new Worker(this.path); } catch (e) { reject(e); return; }
      this.worker = w;
      const timer = setTimeout(() => reject(new Error('Engine-Timeout')), 30000);
      w.onerror = () => { clearTimeout(timer); reject(new Error('Engine-Fehler')); };
      w.onmessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : String(e.data);
        if (line === 'uciok') {
          this.send('setoption name Hash value 16');
          this.send('isready');
        } else if (line === 'readyok' && this._onReady) {
          clearTimeout(timer);
          const cb = this._onReady; this._onReady = null; cb();
        } else if (this.cur) {
          this.cur(line);
        }
      };
      this._onReady = resolve;
      w.postMessage('uci');
    });
    return this.ready;
  }

  send(cmd) { this.worker.postMessage(cmd); }

  /** Analysiert eine Stellung. Liefert {lines:[{multipv,score,mate,depth,pv:[uci]}], best}. */
  analyze(fen, { movetime = 500, depth = 0, multipv = 1, elo = 0 } = {}) {
    const job = () => this.init().then(() => new Promise((resolve) => {
      const lines = new Map();
      this.cur = (l) => {
        if (l.startsWith('info') && l.includes(' pv ') && !/lowerbound|upperbound/.test(l)) {
          const d = +(/ depth (\d+)/.exec(l) || [0, 0])[1];
          const k = +(/ multipv (\d+)/.exec(l) || [0, 1])[1];
          const s = / score (cp|mate) (-?\d+)/.exec(l);
          if (!s) return;
          const v = +s[2];
          const mate = s[1] === 'mate' ? v : null;
          const score = mate === null ? v : (v > 0 ? 10000 - v : -10000 - v);
          const pv = l.split(' pv ')[1].trim().split(/\s+/);
          lines.set(k, { multipv: k, score, mate, depth: d, pv });
        } else if (l.startsWith('bestmove')) {
          this.cur = null;
          const arr = [...lines.values()].sort((a, b) => a.multipv - b.multipv);
          resolve({ lines: arr, best: l.split(' ')[1] });
        }
      };
      // Stärke begrenzen nur für Bot-Züge (elo > 0); Analyse läuft immer mit voller Stärke
      this.send('setoption name UCI_LimitStrength value ' + (elo ? 'true' : 'false'));
      if (elo) this.send('setoption name UCI_Elo value ' + Math.max(1320, Math.min(3190, elo)));
      this.send('setoption name MultiPV value ' + multipv);
      this.send('position fen ' + fen);
      this.send(depth ? 'go depth ' + depth : 'go movetime ' + movetime);
    }));
    const p = this.queue.then(job);
    this.queue = p.catch(() => {});
    return p;
  }
}
