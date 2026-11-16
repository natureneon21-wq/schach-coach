// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
import { Chess } from './vendor/chess.js';
import { pieceHtml } from './pieces.js';

const FILES = 'abcdefgh';

/** Tipp-Tipp-Brett. Hält selbst keinen Spielstand, bekommt ihn per set(). */
export class Board {
  constructor(el, { onMove }) {
    this.el = el;
    this.onMove = onMove;
    this.chess = new Chess();
    this.orientation = 'w';
    this.interactive = null; // 'w' | 'b' | null  (welche Farbe darf der Nutzer bewegen)
    this.selected = null;
    this.last = null;
    this.hint = null;       // {highlight, arrow:{from,to}}
    this.showLegal = true;
    this.promo = null;
    this.el.classList.add('board');
    this.el.addEventListener('click', (e) => this._click(e));
  }

  set(chess, { orientation, last, interactive, hint, showLegal, keepSelection } = {}) {
    this.chess = chess;
    if (orientation) this.orientation = orientation;
    if (last !== undefined) this.last = last;
    if (interactive !== undefined) this.interactive = interactive;
    if (hint !== undefined) this.hint = hint;
    if (showLegal !== undefined) this.showLegal = showLegal;
    if (!keepSelection) { this.selected = null; this.promo = null; }
    this.render();
  }

  _sqAt(i) { // i = 0..63 in Anzeigereihenfolge
    const r = Math.floor(i / 8), f = i % 8;
    return this.orientation === 'w' ? FILES[f] + (8 - r) : FILES[7 - f] + (r + 1);
  }

  render() {
    const c = this.chess;
    const checkSq = c.inCheck() ? this._kingSquare(c.turn()) : null;
    const targets = this.selected ? new Map(c.moves({ square: this.selected, verbose: true }).map((m) => [m.to, m])) : new Map();
    let html = '';
    for (let i = 0; i < 64; i++) {
      const sq = this._sqAt(i);
      const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
      const dark = (f + r) % 2 === 0;
      const p = c.get(sq);
      const cls = ['sq', dark ? 'dark' : 'light'];
      if (this.last && (this.last.from === sq || this.last.to === sq)) cls.push('last');
      if (this.selected === sq) cls.push('sel');
      if (checkSq === sq) cls.push('check');
      if (this.hint && this.hint.highlight === sq) cls.push('hl');
      const tgt = targets.get(sq);
      if (tgt && this.showLegal) cls.push(p ? 'cap' : 'dot');
      let inner = '';
      const row = Math.floor(i / 8), col = i % 8;
      if (col === 0) inner += `<i class="rk">${sq[1]}</i>`;
      if (row === 7) inner += `<i class="fl">${sq[0]}</i>`;
      if (p) inner += pieceHtml(p.type, p.color, this.last && this.last.to === sq ? ' pop' : '');
      html += `<div class="${cls.join(' ')}" data-sq="${sq}">${inner}</div>`;
    }
    html += this._arrowSvg();
    if (this.promo) {
      const col = this.promo.color;
      html += `<div class="promo">${['q', 'r', 'b', 'n'].map((t) => `<button data-promo="${t}">${pieceHtml(t, col)}</button>`).join('')}</div>`;
    }
    this.el.innerHTML = html;
  }

  _kingSquare(color) {
    for (const row of this.chess.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
    return null;
  }

  _center(sq) {
    const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
    return this.orientation === 'w' ? [f + 0.5, 7 - r + 0.5] : [7 - f + 0.5, r + 0.5];
  }

  _arrowSvg() {
    const hh = this.hint;
    const list = hh ? (hh.arrows || (hh.arrow ? [hh.arrow] : [])) : [];
    if (!list.length) return '';
    let out = '';
    for (const a of list) {
      const col = a.color || '#35c98a';
      const [x1, y1] = this._center(a.from), [x2, y2] = this._center(a.to);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      const ex = x2 - ux * 0.35, ey = y2 - uy * 0.35;
      const hx = -uy * 0.28, hy = ux * 0.28;
      out += `<line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="${col}" stroke-width="0.17" stroke-linecap="round" opacity="0.9"/>
      <polygon points="${x2},${y2} ${ex + hx},${ey + hy} ${ex - hx},${ey - hy}" fill="${col}" opacity="0.9"/>`;
    }
    return `<svg class="arrows" viewBox="0 0 8 8">${out}</svg>`;
  }

  _click(e) {
    const promoBtn = e.target.closest('[data-promo]');
    if (promoBtn && this.promo) {
      const { from, to } = this.promo;
      this.promo = null; this.selected = null;
      this.onMove(from, to, promoBtn.dataset.promo);
      return;
    }
    const sqEl = e.target.closest('[data-sq]');
    if (!sqEl || !this.interactive) return;
    if (this.promo) { this.promo = null; this.selected = null; this.render(); return; }
    const sq = sqEl.dataset.sq;
    const c = this.chess;
    if (c.turn() !== this.interactive) return;
    if (this.selected) {
      const mv = c.moves({ square: this.selected, verbose: true }).find((m) => m.to === sq);
      if (mv) {
        if (mv.promotion) {
          this.promo = { from: this.selected, to: sq, color: c.turn() };
          this.render();
          return;
        }
        const from = this.selected;
        this.selected = null;
        this.onMove(from, sq);
        return;
      }
    }
    const p = c.get(sq);
    this.selected = p && p.color === this.interactive && sq !== this.selected ? sq : null;
    this.render();
  }
}
