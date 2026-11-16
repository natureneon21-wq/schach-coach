// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Figuren-Grafiken: mehrere Sets als eigene SVGs (keine fremden Grafiken). Farben kommen aus CSS-Variablen.

const GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
const LETTER = { k: 'K', q: 'D', r: 'T', b: 'L', n: 'S', p: 'B' }; // deutsche Figurenbuchstaben

export const PIECE_SETS = [
  { id: 'klassisch', name: 'Klassisch' },
  { id: 'geo', name: 'Geometrisch' },
  { id: 'kontur', name: 'Kontur' },
  { id: 'buchstaben', name: 'Buchstaben' },
  { id: 'scheibe', name: 'Scheibe' },
];

// Formen im 45x45-Raster. Klasse "d" = nur Linie (Detail), "e" = Auge.
const SHAPES = {
  p: '<circle cx="22.5" cy="13" r="6.2"/><path d="M15.5 35 Q15.5 24 22.5 21.5 Q29.5 24 29.5 35 Z"/><rect x="11" y="35" width="23" height="5" rx="2.2"/>',
  r: '<path d="M12 8 H17 V12.5 H20.2 V8 H24.8 V12.5 H28 V8 H33 V19 L30 22 V32 L33 35.5 V40 H12 V35.5 L15 32 V22 L12 19 Z"/>',
  n: '<path d="M12.5 40 C12.5 32 14.5 26 19.5 21.5 L14.5 18.5 L14 13.5 L19.5 8 L22 10 C29 9.5 34.5 15.5 34.5 24.5 C34.5 31 34 36 33 40 Z"/><circle class="e" cx="21" cy="15" r="1.5"/>',
  b: '<circle cx="22.5" cy="8" r="3.2"/><path d="M22.5 11 C29 16 31 21 28.5 28 H16.5 C14 21 16 16 22.5 11 Z"/><path d="M14 33 Q22.5 28 31 33 V36 H14 Z"/><rect x="11" y="36" width="23" height="4.5" rx="2.2"/><path class="d" d="M22.5 15.5 L26 20"/>',
  q: '<path d="M9 15 L13 31 L16 15 L19 31 L22.5 14 L26 31 L29 15 L32 31 L36 15 L33.5 36 H11.5 Z"/><circle cx="9" cy="12.6" r="2.4"/><circle cx="16" cy="12.6" r="2.4"/><circle cx="22.5" cy="11.6" r="2.4"/><circle cx="29" cy="12.6" r="2.4"/><circle cx="36" cy="12.6" r="2.4"/><rect x="10" y="36" width="25" height="4.5" rx="2.2"/>',
  k: '<rect x="21" y="3" width="3" height="11" rx=".8"/><rect x="17.5" y="6.5" width="10" height="3" rx=".8"/><path d="M12.5 36 C10 26 13 19 22.5 17 C32 19 35 26 32.5 36 Z"/><rect x="10.5" y="36" width="24" height="4.5" rx="2.2"/>',
};

let current = 'klassisch';
export function setPieceSet(id) { current = PIECE_SETS.some((s) => s.id === id) ? id : 'klassisch'; }
export function getPieceSet() { return current; }

/** HTML für eine Figur. color: 'w' | 'b'. */
export function pieceHtml(type, color, extra = '', set = current) {
  if (set === 'klassisch') return `<b class="pc ${color}${extra}">${GLYPH[type]}︎</b>`;
  let inner;
  if (set === 'buchstaben') {
    inner = `<circle cx="22.5" cy="22.5" r="19" class="disc"/><text x="22.5" y="30.5" text-anchor="middle" class="ltr">${LETTER[type]}</text>`;
  } else if (set === 'scheibe') {
    inner = `<circle cx="22.5" cy="22.5" r="19" class="disc"/><text x="22.5" y="32" text-anchor="middle" class="sym">${GLYPH[type]}︎</text>`;
  } else {
    inner = SHAPES[type];
  }
  return `<b class="pc pcs set-${set} ${color}${extra}"><svg viewBox="0 0 45 45" aria-hidden="true">${inner}</svg></b>`;
}
