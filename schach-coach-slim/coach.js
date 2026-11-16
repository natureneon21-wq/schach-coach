// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Animierte Trainerin "Mira": SVG-Figur mit Stimmungen + Sprechblase.

const SVG = `
<svg viewBox="0 0 120 120" class="mira" data-mood="neutral" aria-hidden="true">
  <circle cx="60" cy="60" r="58" fill="#27304a"/>
  <g class="body">
    <path d="M18 120 Q22 90 60 88 Q98 90 102 120 Z" fill="#3e6ff4"/>
    <path d="M48 89 L60 104 L72 89 Z" fill="#f4f6ff"/>
    <circle cx="60" cy="100" r="2.4" fill="#ffd166"/>
    <g class="head">
      <path d="M26 54 Q18 96 36 104 L42 66 Z" fill="#5a2e1f"/>
      <path d="M94 54 Q102 96 84 104 L78 66 Z" fill="#5a2e1f"/>
      <rect x="52" y="78" width="16" height="16" rx="6" fill="#efc09b"/>
      <ellipse cx="60" cy="54" rx="26" ry="29" fill="#f6d3b3"/>
      <path d="M31 52 Q32 21 60 21 Q90 21 89 52 Q76 36 58 38 Q42 38 31 52 Z" fill="#5a2e1f"/>
      <circle cx="43" cy="64" r="5" fill="#ff8fa3" class="cheek"/>
      <circle cx="77" cy="64" r="5" fill="#ff8fa3" class="cheek"/>
      <g class="eyes">
        <ellipse cx="49" cy="55" rx="5" ry="5.6" fill="#fff"/>
        <ellipse cx="71" cy="55" rx="5" ry="5.6" fill="#fff"/>
        <g class="pupils"><circle cx="49" cy="56" r="2.8" fill="#2a1a12"/><circle cx="71" cy="56" r="2.8" fill="#2a1a12"/></g>
      </g>
      <g class="glasses" fill="none" stroke="#2c2c34" stroke-width="1.4">
        <circle cx="49" cy="55" r="8.5"/><circle cx="71" cy="55" r="8.5"/><path d="M57.5 55 H62.5"/>
      </g>
      <path class="brow brow-l" d="M42 44 Q49 41 56 44" stroke="#4a2619" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path class="brow brow-r" d="M64 44 Q71 41 78 44" stroke="#4a2619" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g class="mouths" fill="none" stroke="#a3394a" stroke-width="2.2" stroke-linecap="round">
        <path class="m m-neutral" d="M52 73 Q60 77 68 73"/>
        <path class="m m-happy" d="M50 71 Q60 83 70 71" fill="#fff"/>
        <path class="m m-think" d="M53 75 Q58 72 66 75"/>
        <path class="m m-worry" d="M52 77 Q60 70 68 77"/>
        <ellipse class="m m-wow" cx="60" cy="75" rx="4.5" ry="5.5" fill="#7a2434"/>
        <ellipse class="m-talk" cx="60" cy="74" rx="5" ry="4" fill="#7a2434" stroke="none"/>
      </g>
    </g>
  </g>
</svg>`;

export function createCoach(root) {
  root.classList.add('coach');
  root.innerHTML = `<div class="avatar">${SVG}</div>
    <div class="bubble"><div class="bubble-text"></div><div class="bubble-actions"></div></div>`;
  const svg = root.querySelector('svg');
  const textEl = root.querySelector('.bubble-text');
  const actEl = root.querySelector('.bubble-actions');
  let talkTimer = null;

  function anim(cls) {
    svg.classList.remove('nod', 'shake', 'bounce');
    void svg.getBoundingClientRect();
    svg.classList.add(cls);
  }

  function say(text, mood = 'neutral', actions = [], effect = null) {
    svg.dataset.mood = mood;
    if (effect) anim(effect);
    textEl.textContent = text;
    actEl.innerHTML = '';
    for (const a of actions) {
      const b = document.createElement('button');
      b.textContent = a.label;
      b.className = 'btn small' + (a.primary ? ' primary' : '');
      b.onclick = () => a.onClick();
      actEl.appendChild(b);
    }
    svg.classList.add('talking');
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => svg.classList.remove('talking'), Math.min(3000, 400 + text.length * 28));
  }

  return { say, setMood: (m) => { svg.dataset.mood = m; }, clearActions: () => { actEl.innerHTML = ''; } };
}

export const MOOD_FOR = { best: ['happy', 'nod'], good: ['happy', 'nod'], inacc: ['think', null], mistake: ['worry', null], blunder: ['wow', 'shake'] };
