// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Aussehen & Layout: Brettfarben, Figuren-Sets/-Farben, Trainer-Avatar, Vollbild / Bild-im-Bild.
import { PIECE_SETS, setPieceSet, pieceHtml } from './pieces.js';
import { AVATARS, avatarSvg } from './coach.js';

export const BOARD_THEMES = [
  { id: 'gruen', name: 'Grün', light: '#ead9b8', dark: '#6f8f72' },
  { id: 'holz', name: 'Holz', light: '#f0d9b5', dark: '#b58863' },
  { id: 'blau', name: 'Blaugrau', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'ozean', name: 'Ozean', light: '#cfe8f3', dark: '#3b7ea1' },
  { id: 'lila', name: 'Lila', light: '#e8dff5', dark: '#9170c0' },
  { id: 'rosa', name: 'Rosa', light: '#fbe3ea', dark: '#d97a98' },
  { id: 'koralle', name: 'Koralle', light: '#fde8d7', dark: '#e0735c' },
  { id: 'sand', name: 'Sand', light: '#f3e9d2', dark: '#c9a66b' },
  { id: 'schiefer', name: 'Schiefer', light: '#c9ced6', dark: '#5b6577' },
  { id: 'nacht', name: 'Nacht', light: '#8d96b0', dark: '#3a4260' },
  { id: 'mint', name: 'Mint', light: '#e3f4ec', dark: '#5fb59a' },
  { id: 'kontrast', name: 'Hoher Kontrast', light: '#ffffff', dark: '#3d3d3d' },
  { id: 'neon', name: 'Neon', light: '#262f5a', dark: '#0e1230' },
  { id: 'biomech', name: 'Biomech', light: '#6b7479', dark: '#2a3236' },
  { id: 'gruft', name: 'Gruft', light: '#5b4e52', dark: '#241a1f' },
  { id: 'asche', name: 'Asche', light: '#8a8070', dark: '#3a3229' },
];

// Farben für die SVG-Sets (der klassische Unicode-Satz bleibt Weiß/Schwarz)
export const PIECE_COLORS = [
  { id: 'klassisch', name: 'Weiß / Schwarz', w: '#ffffff', wo: '#2a2a33', b: '#2b2b33', bo: '#0d0d12' },
  { id: 'gold', name: 'Gold / Nachtblau', w: '#ffd45e', wo: '#7a5a00', b: '#1f2a52', bo: '#0b1230' },
  { id: 'blaurot', name: 'Blau / Rot', w: '#6fb1ff', wo: '#123a73', b: '#ef6a6a', bo: '#6d1717' },
  { id: 'minzviolett', name: 'Mint / Violett', w: '#8ff0cf', wo: '#0f5c47', b: '#8a63d2', bo: '#2c1457' },
  { id: 'elfenbein', name: 'Elfenbein / Ebenholz', w: '#f6ecd4', wo: '#5c4a2a', b: '#4a3524', bo: '#1c120a' },
  { id: 'neon', name: 'Neon Cyan / Pink', w: '#2ff3ff', wo: '#0a6f78', b: '#ff3fd2', bo: '#7a0f63' },
  { id: 'knochen', name: 'Knochen / Graphit', w: '#e4dfd0', wo: '#4d4a3f', b: '#5a686e', bo: '#0b0e10' },
  { id: 'blut', name: 'Silber / Blutrot', w: '#d7d9e0', wo: '#3a3d4a', b: '#c2303b', bo: '#2a0508' },
  { id: 'asche', name: 'Asche / Rost', w: '#d3cbb8', wo: '#3a3228', b: '#6b5442', bo: '#140d08' },
];

export const LOOK_DEFAULTS = { board: 'gruen', pieceSet: 'geo', pieceColor: 'klassisch', avatar: 'mira', layout: 'full', pipPos: 'bottom', pipH: 26 };

const find = (list, id) => list.find((x) => x.id === id) || list[0];

// Platzhalter für das Video-Fenster mit Griff: am Griff ziehen = Bereich live auf die Videogröße anpassen.
let saveFn = () => {};
function mountPipGuide(s) {
  if (document.getElementById('pip-guide')) return;
  const g = document.createElement('div');
  g.id = 'pip-guide';
  g.innerHTML = '<span class="pip-label">Hier das Video-Fenster platzieren</span><div class="pip-grip" title="Ziehen, um den Bereich anzupassen"><i></i></div>';
  document.body.appendChild(g);
  const grip = g.querySelector('.pip-grip');
  const setFromY = (y) => {
    const h = window.innerHeight;
    const pct = s.pipPos === 'top' ? (y / h) * 100 : ((h - y) / h) * 100;
    s.pipH = Math.round(Math.max(12, Math.min(45, pct)));
    document.documentElement.style.setProperty('--pip-h', `${s.pipH}dvh`);
    document.dispatchEvent(new CustomEvent('pipchange'));
  };
  grip.addEventListener('pointerdown', (e) => { grip.setPointerCapture(e.pointerId); g.classList.add('drag'); e.preventDefault(); });
  grip.addEventListener('pointermove', (e) => { if (g.classList.contains('drag')) setFromY(e.clientY); });
  const end = () => { if (g.classList.contains('drag')) { g.classList.remove('drag'); saveFn(); } };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
}

/** Setzt CSS-Variablen und Layout-Attribute. */
export function applyLook(s) {
  const root = document.documentElement;
  const t = find(BOARD_THEMES, s.board);
  root.style.setProperty('--light', t.light);
  root.style.setProperty('--dark', t.dark);
  const c = find(PIECE_COLORS, s.pieceColor);
  root.style.setProperty('--pw', c.w); root.style.setProperty('--pwo', c.wo);
  root.style.setProperty('--pb', c.b); root.style.setProperty('--pbo', c.bo);
  setPieceSet(s.pieceSet);
  root.style.setProperty('--pip-h', `${Math.max(12, Math.min(45, +s.pipH || 26))}dvh`);
  mountPipGuide(s);
  document.body.dataset.layout = s.layout === 'pip' ? 'pip' : 'full';
  document.body.dataset.pipPos = s.pipPos === 'top' ? 'top' : 'bottom';
}

/** Baut den Bereich "Aussehen" in den Einstellungen. onChange(kind) wird nach jeder Änderung gerufen. */
export function initLookSettings(box, s, save, onChange) {
  saveFn = save;
  document.addEventListener('pipchange', () => {
    const r = box.querySelector('#pip-h'), v = box.querySelector('#pip-val');
    if (r) r.value = s.pipH;
    if (v) v.textContent = s.pipH;
  });
  const render = () => {
    const sw = (t) => `<span class="sw"><i style="background:${t.light}"></i><i style="background:${t.dark}"></i></span>`;
    box.innerHTML = `
      <h2>Aussehen</h2>
      <p class="lbl">Brettfarbe</p>
      <div class="grid-pick" data-k="board">${BOARD_THEMES.map((t) => `<button data-v="${t.id}" class="${s.board === t.id ? 'on' : ''}">${sw(t)}<small>${t.name}</small></button>`).join('')}</div>
      <p class="lbl">Figuren</p>
      <div class="grid-pick" data-k="pieceSet">${PIECE_SETS.map((p) => `<button data-v="${p.id}" class="${s.pieceSet === p.id ? 'on' : ''}"><span class="pv"><span class="pvb">${pieceHtml('n', 'w', '', p.id)}</span><span class="pvb">${pieceHtml('q', 'b', '', p.id)}</span></span><small>${p.name}</small></button>`).join('')}</div>
      <p class="lbl">Figurenfarben <small>(für alle Sets außer „Klassisch“)</small></p>
      <div class="grid-pick" data-k="pieceColor">${PIECE_COLORS.map((c) => `<button data-v="${c.id}" class="${s.pieceColor === c.id ? 'on' : ''}"><span class="sw"><i style="background:${c.w}"></i><i style="background:${c.b}"></i></span><small>${c.name}</small></button>`).join('')}</div>
      <p class="lbl">Trainer-Avatar</p>
      <div class="grid-pick" data-k="avatar">${AVATARS.map((a) => `<button data-v="${a.id}" class="${s.avatar === a.id ? 'on' : ''}"><span class="av">${avatarSvg(a.id)}</span><small>${a.name}</small></button>`).join('')}</div>
      <p class="lbl">Layout</p>
      <div class="seg" data-k="layout"><button data-v="full" class="${s.layout !== 'pip' ? 'on' : ''}">Vollbild</button><button data-v="pip" class="${s.layout === 'pip' ? 'on' : ''}">Bild-im-Bild</button></div>
      <div id="pip-opts" ${s.layout === 'pip' ? '' : 'hidden'}>
        <p class="lbl">Wo soll das Video-Fenster schweben?</p>
        <div class="seg" data-k="pipPos"><button data-v="top" class="${s.pipPos === 'top' ? 'on' : ''}">Oben</button><button data-v="bottom" class="${s.pipPos !== 'top' ? 'on' : ''}">Unten</button></div>
        <label class="field">Platz für das Video: <b id="pip-val">${s.pipH}</b> % der Höhe
          <input type="range" id="pip-h" min="15" max="40" step="1" value="${s.pipH}"></label>
        <p class="note">Starte das Video (YouTube, Netflix …) in seiner App, wechsle per Bild-im-Bild zurück und schiebe das kleine Fenster in den gestrichelten Bereich. Passt der Bereich nicht, zieh am Griff an seiner Innenkante, bis er zum Video passt. Brett, dein Coach und die Tasten bleiben frei. Ob Bild-im-Bild klappt, hängt von der Video-App und deinem Konto ab.</p>
      </div>
      <button class="btn small" id="fs-toggle">Browser-Vollbild an/aus</button>`;
    box.querySelectorAll('.grid-pick, .seg').forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) return;
        const k = g.dataset.k;
        s[k] = b.dataset.v;
        if (k === 'pieceSet') { const ps = PIECE_SETS.find((x) => x.id === s[k]); if (ps && ps.color) { s.pieceColor = ps.color; s.board = ps.board; } }
        save(); applyLook(s); onChange(k); render();
      });
    });
    const rng = box.querySelector('#pip-h');
    if (rng) rng.oninput = () => { s.pipH = +rng.value; box.querySelector('#pip-val').textContent = rng.value; save(); applyLook(s); };
    box.querySelector('#fs-toggle').onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    };
  };
  render();
}
