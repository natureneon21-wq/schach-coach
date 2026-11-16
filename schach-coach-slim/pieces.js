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
  { id: 'staunton', name: 'Staunton', color: 'elfenbein', board: 'holz' },
  { id: 'cyber', name: 'Cyber', color: 'neon', board: 'neon' },
  { id: 'alien', name: 'Alien', color: 'knochen', board: 'biomech' },
  { id: 'gothic', name: 'Gothic', color: 'blut', board: 'gruft' },
  { id: 'duester', name: 'Düster', color: 'asche', board: 'asche' },
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

// Eigene Formen pro Stil (alle selbst gezeichnet, keine fremden Vorlagen). "d" = Linie, "e" = Auge/Leuchtpunkt.
const BASE_ST = '<rect x="11.5" y="34.5" width="22" height="3" rx="1.5"/><rect x="10" y="37.5" width="25" height="3.5" rx="1.7"/>';
const BASE_CY = '<path d="M10 40.5 V37 L12.5 35 H32.5 L35 37 V40.5 Z"/>';
const BASE_AL = '<path d="M9.5 40.5 C9.5 37 12 35.5 14 35 H31 C33 35.5 35.5 37 35.5 40.5 Z"/><path class="d" d="M14 38 H31"/>';
const BASE_GO = '<path d="M9.5 40.5 L11 37 H34 L35.5 40.5 Z"/><path d="M12 37 L14 34 H31 L33 37 Z"/>';
const BASE_DU = '<rect x="10.5" y="36" width="24" height="4.5" rx=".8"/><path class="d" d="M10.5 38 H20 M24 38.5 H34.5"/>';
const SHAPE_SETS = {
  staunton: {
    p: '<circle cx="22.5" cy="11.5" r="5"/><rect x="16.5" y="16.5" width="12" height="2.6" rx="1.3"/><path d="M18.3 19.5 C19.5 25 18 30 14.5 34.5 H30.5 C27 30 25.5 25 26.7 19.5 Z"/>' + BASE_ST,
    r: '<path d="M13.5 8 H17.2 V11 H20.7 V8 H24.3 V11 H27.8 V8 H31.5 V15 H29.5 L28.5 17.5 V30 L31 34.5 H14 L16.5 30 V17.5 L15.5 15 H13.5 Z"/>' + BASE_ST,
    n: '<path d="M13 37.5 C13 30 15 25 19 21 C16.5 20.5 14 19 12.5 17.5 L13 14.5 L17 10 L18 6.5 L20.5 9 C27 9 33 14 33 23 C33 28.5 32.5 33 32 37.5 Z"/><circle class="e" cx="19.5" cy="13.8" r="1.2"/><path class="d" d="M22 10.5 C26 12.5 28 16.5 28 21"/><rect x="10" y="37.5" width="25" height="3.5" rx="1.7"/>',
    b: '<circle cx="22.5" cy="4.6" r="2.2"/><path d="M22.5 6.5 C27 10.5 30 14.5 28.5 19.8 C28 21.2 27.5 21.8 27 22.2 H18 C17.5 21.8 17 21.2 16.5 19.8 C15 14.5 18 10.5 22.5 6.5 Z"/><path class="d" d="M22.5 11 L25.5 16"/><rect x="16" y="22.2" width="13" height="2.6" rx="1.3"/><path d="M18.5 25 C19.5 29 18 32 15 34.5 H30 C27 32 25.5 29 26.5 25 Z"/>' + BASE_ST,
    q: '<path d="M12 13 L15 29 L17.5 15 L20.3 28.5 L22.5 13 L24.7 28.5 L27.5 15 L30 29 L33 13 L31.5 34.5 H13.5 Z"/><circle cx="12" cy="11.5" r="2.2"/><circle cx="17.5" cy="12.5" r="2.2"/><circle cx="22.5" cy="10.5" r="2.2"/><circle cx="27.5" cy="12.5" r="2.2"/><circle cx="33" cy="11.5" r="2.2"/>' + BASE_ST,
    k: '<rect x="21" y="2.5" width="3" height="9.5" rx=".8"/><rect x="17.8" y="5.5" width="9.4" height="3" rx=".8"/><path d="M14 17.5 C14 14.5 18 13 22.5 13 C27 13 31 14.5 31 17.5 C31 20 29 21 28 22 L29.5 34.5 H15.5 L17 22 C16 21 14 20 14 17.5 Z"/>' + BASE_ST,
  },
  cyber: {
    p: '<path d="M22.5 6 L27.5 9.5 V15 L24.5 18 L27 20.5 V30.5 L30.5 35 H14.5 L18 30.5 V20.5 L20.5 18 L17.5 15 V9.5 Z"/><path class="e" d="M19.5 11 H25.5 V13 H19.5 Z"/><path class="d" d="M22.5 22 V31"/>' + BASE_CY,
    r: '<path d="M12 7 H18 V12 H21 V7 H24 V12 H27 V7 H33 V17 L29.5 20 V30.5 L33 35 H12 L15.5 30.5 V20 L12 17 Z"/><path class="d" d="M19 22 V30 M26 22 V27 L24 30"/><path class="e" d="M18.5 14.5 H26.5 V16 H18.5 Z"/>' + BASE_CY,
    n: '<path d="M12 35 V32 L16 25 L14 20 L13 15 L19 8 L21 4.5 L24 8 C31 9 35 15 35 24 L33 35 Z"/><path class="e" d="M16.5 13 L21 12 L21.5 14.5 L17 16 Z"/><path class="d" d="M24 11 L30 17 L31 25"/>' + BASE_CY,
    b: '<path d="M22.5 3.5 L28 12 L30 20 L26 26 V30.5 L30 35 H15 L19 30.5 V26 L15 20 L17 12 Z"/><path class="d" d="M22.5 8 V11"/><path class="e" d="M22.5 13 L24.2 16.2 L22.5 19.4 L20.8 16.2 Z"/>' + BASE_CY,
    q: '<path d="M10 11 L15 26 L17 10 L20 26 L22.5 6 L25 26 L28 10 L30 26 L35 11 L32 35 H13 Z"/><path class="d" d="M16 30 H29"/><path class="e" d="M21 17 H24 V20 H21 Z"/>' + BASE_CY,
    k: '<path d="M20.5 2 H24.5 V6 H28 V9.5 H24.5 V13 H20.5 V9.5 H17 V6 H20.5 Z"/><path d="M13 35 L14 22 L18 16 H27 L31 22 L32 35 Z"/><path class="e" d="M18 22 H27 V25 H18 Z"/>' + BASE_CY,
  },
  alien: {
    p: '<path d="M22.5 3 C29 3 31 10 29.5 16 L28 20 H17 L15.5 16 C14 10 16 3 22.5 3 Z"/><path class="d" d="M22.5 4 V15"/><path class="e" d="M18.8 11 Q20.3 14.5 21.6 11 Z M23.4 11 Q24.7 14.5 26.2 11 Z"/><path d="M18 21 C19 26 17 30 14 34.5 H31 C28 30 26 26 27 21 Z"/><path class="d" d="M19 25 H26 M17.5 29 H27.5"/>' + BASE_AL,
    r: '<path d="M13 8 H17 L18 12 H27 L28 8 H32 V18 L29 21 V30.5 L32 34 H13 L16 30.5 V21 L13 18 Z"/><path class="d" d="M19 21.5 V31 M22.5 21.5 V31 M26 21.5 V31"/><path class="d" d="M18 15 H27"/>' + BASE_AL,
    n: '<path d="M12 35 C12 30 14 26 17 22 L12 21 C11 19 12 17 14 16 L22 11 C24 7 28 4 34 4 C32 8 31.5 10 30 12 C34 16 35 22 34 28 L33 35 Z"/><path class="d" d="M13 18 L21 17.5 M14.5 20 L20 19.5"/><path class="e" d="M24 14 L28 13 L27 16 Z"/><path class="d" d="M30 14 C32 18 32 24 31 30"/>' + BASE_AL,
    b: '<path d="M22.5 2.5 C29 6 31 14 29 21 L27.5 24 H17.5 L16 21 C14 14 16 6 22.5 2.5 Z"/><path class="d" d="M22.5 6 V19"/><path d="M18.5 25 L19 32 L15 35 H30 L26 32 L26.5 25 Z"/><path class="d" d="M19 28 H26"/>' + BASE_AL,
    q: '<path d="M9 9 C11 16 12 22 14 27 C15 20 15 14 17 8 C18 14 19 20 20.5 26 C21 18 21.5 10 22.5 3 C23.5 10 24 18 24.5 26 C26 20 27 14 28 8 C30 14 30 20 31 27 C33 22 34 16 36 9 L33 34.5 H12 Z"/><path class="d" d="M16 31 H29"/>' + BASE_AL,
    k: '<path d="M21 2 H24 V8 H29 V11 H24 V15 H21 V11 H16 V8 H21 Z"/><path d="M13.5 35 C12 26 15 18 22.5 16 C30 18 33 26 31.5 35 Z"/><path class="d" d="M16.5 24 C20 26 25 26 28.5 24 M15.5 29 H29.5"/><path class="d" d="M22.5 17 V34"/>' + BASE_AL,
  },
  gothic: {
    p: '<path d="M22.5 3.5 C25 8 27 11 26 15 C28 17 28.5 19 27 21 C28 26 29 30 31.5 34 H13.5 C16 30 17 26 18 21 C16.5 19 17 17 19 15 C18 11 20 8 22.5 3.5 Z"/><path class="d" d="M22.5 10 V28"/>' + BASE_GO,
    r: '<path d="M13 6 L15.5 11 L18 6 L20.5 11 L22.5 5 L24.5 11 L27 6 L29.5 11 L32 6 V19 L29 22 V30.5 L32 33.5 H13 L16 30.5 V22 L13 19 Z"/><path class="e" d="M20.3 31 V25.5 Q22.5 22 24.7 25.5 V31 Z"/>' + BASE_GO,
    n: '<path d="M12.5 34 C12.5 30 14 25.5 18 22 L13 20 L12 15 L16 12 L14.5 4 L20 8 L24 7 C31 8 34 14 34 24 L33 34 Z"/><path class="e" d="M18.5 12.5 L21 12 L20.8 14 Z"/><path class="d" d="M23 10 C27 12 29 17 29 22 M26 9 C30 11 32 16 32 21"/>' + BASE_GO,
    b: '<path d="M22.5 3 C26 8 31 12 30.5 19 C30.3 21.5 29 23 27 24 H18 C16 23 14.7 21.5 14.5 19 C14 12 19 8 22.5 3 Z"/><path class="d" d="M22.5 9 V17 M19.5 12.5 H25.5"/><path d="M18.5 24.5 C19.5 28 18 31 15 33.5 H30 C27 31 25.5 28 26.5 24.5 Z"/>' + BASE_GO,
    q: '<path d="M9 10 C11 16 12 22 14 27 C15 20 15 14 17 8 C18 14 19 20 20.5 26 C21 18 21.5 10 22.5 3 C23.5 10 24 18 24.5 26 C26 20 27 14 28 8 C30 14 30 20 31 27 C33 22 34 16 36 10 L33 34 H12 Z"/><path class="e" d="M22.5 22 L24 26 L22.5 30 L21 26 Z"/>' + BASE_GO,
    k: '<path d="M21 1.5 H24 V5 H27.5 V8 H24 V12 H21 V8 H17.5 V5 H21 Z"/><path d="M14 34 L15 23 C15 19 19 16.5 22.5 14.5 C26 16.5 30 19 30 23 L31 34 Z"/><path class="e" d="M20.3 31 V24.5 Q22.5 21 24.7 24.5 V31 Z"/>' + BASE_GO,
  },
  duester: {
    p: '<path d="M15 19 C15 10 19 5 22.5 5 C26 5 30 10 30 19 V22 H15 Z"/><path class="e" d="M17.5 13 H27.5 V15 H17.5 Z"/><path d="M17 23 L15 35 H30 L28 23 Z"/><path class="d" d="M22.5 23 V35"/>' + BASE_DU,
    r: '<path d="M13 12 L16 8 L18 12 L21 6 L24 11 L27 7 L29 12 L32 10 V19 L29 22 V30.5 L32 34 H13 L16 30.5 V22 L13 19 Z"/><path class="d" d="M20 24 L22 28 L21 32"/><path class="e" d="M25 24 V27"/>' + BASE_DU,
    n: '<path d="M12.5 36 C12.5 31 14 26 18 22 L13 20 L12.5 15 L18 8 C19 6 21 5 22 5 C23 6 24 6.5 24.5 8 C31 9 34 15 34 25 C34 30 34 33 33 36 Z"/><path class="e" d="M15.5 13.5 L19.5 12.5 L19.5 14.5 Z"/><path class="d" d="M16 18 L24 15 L30 22 M24.5 8 C27 5 31 5 33 7"/>' + BASE_DU,
    b: '<path d="M22.5 4 C28 4 31 9 30 14 C30 17 29 19 28 21 L31 28 V34 H14 V28 L17 21 C16 19 15 17 15 14 C14 9 17 4 22.5 4 Z"/><path class="e" d="M19.5 11 H25.5 V17 L22.5 19 L19.5 17 Z"/>' + BASE_DU,
    q: '<path d="M10 14 L14 10 L17 24 L19 8 L22.5 22 L26 8 L28 24 L31 10 L35 14 L32 35 H13 Z"/><path class="d" d="M17 30 H28"/><path class="e" d="M21.5 25 H23.5 V27 H21.5 Z"/>' + BASE_DU,
    k: '<path d="M21 2 H24 V21 H21 Z"/><rect x="15" y="12" width="15" height="3" rx="1"/><path d="M14 35 L15 24 C15 22 18 21 22.5 21 C27 21 30 22 30 24 L31 35 Z"/><path class="e" d="M22.5 24 V31"/>' + BASE_DU,
  },
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
    inner = SHAPE_SETS[set] ? SHAPE_SETS[set][type] : SHAPES[type];
  }
  return `<b class="pc pcs set-${set} ${color}${extra}"><svg viewBox="0 0 45 45" aria-hidden="true">${inner}</svg></b>`;
}
