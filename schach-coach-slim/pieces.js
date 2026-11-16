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
const BASE_CY = '<path d="M11 40.5 L13.5 37.5 H31.5 L34 40.5 Z"/>';
const BASE_AL = '<path d="M8 40.5 C8 36.5 13 34.5 22.5 34.5 C32 34.5 37 36.5 37 40.5 Z"/><path class="d" d="M12 38 C18 39.4 27 39.4 33 38"/>';
const T = (d, w) => `<path class="to" style="stroke-width:${w + 2.6}" d="${d}"/><path class="tb" style="stroke-width:${w}" d="${d}"/>`;
const BASE_GO2 = '<path d="M8 40.5 L10 36 L14 38 L18 35 L22.5 38 L27 35 L31 38 L35 36 L37 40.5 Z"/>';
const BASE_DU2 = '<path d="M8 40.5 L10 37.5 L15 38.5 L19 36 L24 38 L29 36 L34 38.5 L37 40.5 Z"/>';
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
    p: '<path d="M22.5 5 L29 14 L22.5 23 L16 14 Z"/><path class="e" d="M22.5 10 L25 14 L22.5 18 L20 14 Z"/><path class="d" d="M22.5 24 V35"/>' + BASE_CY,
    r: '<rect x="14" y="26" width="17" height="9"/><rect x="11" y="17" width="14" height="8"/><rect x="18" y="8" width="15" height="8"/><path class="e" d="M16 29 H20 V31 H16 Z M13 20 H17 V22 H13 Z M27 11 H31 V13 H27 Z"/>' + BASE_CY,
    n: '<path d="M12 35 L18 13 L22 17 L34 9 L31 23 L33 35 Z"/><path class="e" d="M24 15 L29 13 L27.5 17 Z"/><path class="d" d="M12 35 L24 24 L33 35"/>' + BASE_CY,
    b: '<path d="M22.5 1.5 L29 11 L26.5 30 H18.5 L16 11 Z"/><path class="d" d="M22.5 2 V30"/><ellipse class="d" cx="22.5" cy="20" rx="12" ry="3.4"/><path class="e" d="M22.5 8 L24 11 L22.5 14 L21 11 Z"/>' + BASE_CY,
    q: '<path d="M8 8 L12 22 L16 11 Z"/><path d="M15 3 L19 22 L24 7 Z"/><path d="M26 7 L26 22 L31 3 Z"/><path d="M29 11 L33 22 L37 8 Z"/><path d="M22.5 22 L28 27.5 L22.5 34 L17 27.5 Z"/><path class="e" d="M22.5 25.5 L24.4 27.5 L22.5 30 L20.6 27.5 Z"/>' + BASE_CY,
    k: '<path d="M17.5 35 V15 L22.5 9 L27.5 15 V35 Z"/><ellipse class="d" cx="22.5" cy="11" rx="12" ry="4"/><path class="d" d="M22.5 1 V9"/><path class="e" d="M21 17 H24 V31 H21 Z"/>' + BASE_CY,
  },
  alien: {
    p: T('M22.5 34 C22.5 27 17 25 18 19 C19 13 26 13 26.5 18 C27 22 22.5 22 22.5 18.5', 4.4) + '<circle class="e" cx="22.5" cy="18.4" r="1.2"/>' + BASE_AL,
    r: T('M17 34 C28 29 17 24 27 19 C30 17 28.5 13 24 11', 4) + T('M28 34 C17 29 28 24 18 19 C15 17 16.5 13 21 11', 4) + '<path d="M13.5 6 H31.5 L29.5 11.5 H15.5 Z"/>' + BASE_AL,
    n: T('M20 34 C15 26 22 22 20 16 C18 10.5 25 5.5 30.5 9 C34 11.5 32 17.5 28 16', 5.4) + T('M26 34 C30 30 34 31 36 25.5', 3) + '<circle class="e" cx="25.5" cy="10.5" r="1.4"/>' + BASE_AL,
    b: '<path d="M22.5 2 C31 9 30.5 18 22.5 24 C14.5 18 14 9 22.5 2 Z"/><path class="d" d="M22.5 7 V19"/>' + T('M22.5 24 C19.5 28 25.5 30 22.5 34', 3.8) + BASE_AL,
    q: T('M22.5 27 C17 22 11 18 10 9', 3) + T('M22.5 27 C19 21 17 14 17 6', 3) + T('M22.5 27 C22 19 23 12 22.5 3', 3) + T('M22.5 27 C26 21 28 14 28 6', 3) + T('M22.5 27 C28 22 34 18 35 9', 3) + '<circle cx="22.5" cy="28" r="5.8"/><circle class="e" cx="22.5" cy="28" r="1.8"/>' + BASE_AL,
    k: '<path d="M22.5 2 C32 5 31 20 22.5 24 C14 20 13 5 22.5 2 Z"/><path class="d" d="M22.5 4 V21 M16 12 H29"/>' + T('M22.5 24 C16 28 29 30 22.5 34', 4.6) + BASE_AL,
  },
  gothic: {
    p: '<path d="M22.5 34 C16 26 18 14 26 3 C25 14 30 22 28 34 Z"/><path class="d" d="M23 10 C22 18 23 26 23.5 33"/>' + BASE_GO2,
    r: '<path d="M11.5 35 V17 L15.5 5 L19.5 17 V35 Z"/><path d="M18.5 35 V12 L22.5 1.5 L26.5 12 V35 Z"/><path d="M25.5 35 V17 L29.5 5 L33.5 17 V35 Z"/><path class="e" d="M20.8 33 V24 Q22.5 19 24.2 24 V33 Z"/>' + BASE_GO2,
    n: '<path d="M14 35 L15 24 C15 19 19 16 22.5 16 C26 16 30 19 30 24 L31 35 Z"/><path d="M16 19 C10 17 8 11 9 4 C13 9 16 11 19 14 Z"/><path d="M29 19 C35 17 37 11 36 4 C32 9 29 11 26 14 Z"/><path class="e" d="M17.5 22 L21 23 L18 25 Z M27.5 22 L24 23 L27 25 Z"/>' + BASE_GO2,
    b: '<path d="M22.5 1.5 C25 10 31 14 31 22 V34 H14 V22 C14 14 20 10 22.5 1.5 Z"/><path class="e" d="M19.3 33 V24 Q22.5 17 25.7 24 V33 Z"/><path class="d" d="M22.5 7 V12 M20.2 9.5 H24.8"/>' + BASE_GO2,
    q: '<path d="M22.5 34 L5 14 L16 22 L10 5 L19 20 L22.5 1 L26 20 L35 5 L29 22 L40 14 Z"/><path class="e" d="M22.5 23 L24.5 27.5 L22.5 32 L20.5 27.5 Z"/>' + BASE_GO2,
    k: '<path d="M22.5 1 L25 9 L33 7.5 L28 15 L31 34 H14 L17 15 L12 7.5 L20 9 Z"/><path class="e" d="M22.5 16 L24.5 23 L22.5 31 L20.5 23 Z"/>' + BASE_GO2,
  },
  duester: {
    p: '<path d="M13 35 L15 29 H30 L32 35 Z"/><path d="M16 29 L18 23 H27 L29 29 Z"/><path d="M19 23 L21 18 H25 L26 23 Z"/><path class="e" d="M22.5 7 C26 11 25 14.5 22.5 17 C20 14.5 19 11 22.5 7 Z"/>' + BASE_DU2,
    r: '<path d="M13 35 V14 L17 12 L19 16 L23 10 L27 15 L32 13 V35 Z"/><path class="d" d="M18 24 L21 28 L19 33 M27 20 V26"/><path class="e" d="M22.5 22 C25 26 24 29 22.5 31 C21 29 20 26 22.5 22 Z"/>' + BASE_DU2,
    n: '<path d="M14 35 V20 C14 12 18 8 23 8 C28 8 31 12 31 20 V35 Z"/><path d="M24 8 C26 2 33 1 37 6 C32 4 29 6 28 10 Z"/><path class="e" d="M17 19 H28 V21.5 H17 Z"/><path class="d" d="M22.5 22 V35 M14 28 H31"/>' + BASE_DU2,
    b: '<path d="M14 34 L16.5 20 C14.5 15 16.5 7 22 7 C27.5 7 29.5 15 27.5 20 L30 34 Z"/><path class="e" d="M19.5 14 H24.5 V18.5 H19.5 Z"/><path class="d" d="M36 10 V34"/><circle cx="36" cy="8" r="2.6"/>' + BASE_DU2,
    q: '<path d="M11 15 L15 8 L18.5 14 L22.5 5 L26.5 14 L30 8 L34 15 L31 20 L33 35 H12 L14 20 Z"/><path class="e" d="M19 18 H26 V21 H19 Z"/>' + BASE_DU2,
    k: '<circle cx="22.5" cy="3.4" r="2.3"/><rect x="21" y="5" width="3" height="6"/><path d="M10.5 9.5 C14 12 17 11.5 20 11.5 H25 C28 11.5 31 12 34.5 9.5 C33 15 28.5 15.5 25 15 H20 C16.5 15.5 12 15 10.5 9.5 Z"/><path d="M20 15 H25 L24 33 L22.5 37 L21 33 Z"/><path class="e" d="M22.5 18 V30"/>' + BASE_DU2,
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
