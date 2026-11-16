// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Animierte Trainerin "Mira": SVG-Figur mit Stimmungen + Sprechblase. Mehrere Avatare zur Auswahl.

// Gemeinsames Gesicht (Augen, Brauen, Münder), damit alle Avatare dieselben Stimmungen/Animationen haben.
function face({ glasses = false, mouth = '#a3394a', cheek = '#ff8fa3', brow = '#4a2619', eye = '#fff', pupil = '#2a1a12', cheeks = true } = {}) {
  return `
      ${cheeks ? `<circle cx="43" cy="64" r="5" fill="${cheek}" class="cheek"/><circle cx="77" cy="64" r="5" fill="${cheek}" class="cheek"/>` : ''}
      <g class="eyes">
        <ellipse cx="49" cy="55" rx="5" ry="5.6" fill="${eye}"/>
        <ellipse cx="71" cy="55" rx="5" ry="5.6" fill="${eye}"/>
        <g class="pupils"><circle cx="49" cy="56" r="2.8" fill="${pupil}"/><circle cx="71" cy="56" r="2.8" fill="${pupil}"/></g>
      </g>
      ${glasses ? '<g class="glasses" fill="none" stroke="#2c2c34" stroke-width="1.4"><circle cx="49" cy="55" r="8.5"/><circle cx="71" cy="55" r="8.5"/><path d="M57.5 55 H62.5"/></g>' : ''}
      <path class="brow brow-l" d="M42 44 Q49 41 56 44" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path class="brow brow-r" d="M64 44 Q71 41 78 44" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g class="mouths" fill="none" stroke="${mouth}" stroke-width="2.2" stroke-linecap="round">
        <path class="m m-neutral" d="M52 73 Q60 77 68 73"/>
        <path class="m m-happy" d="M50 71 Q60 83 70 71" fill="#fff"/>
        <path class="m m-think" d="M53 75 Q58 72 66 75"/>
        <path class="m m-worry" d="M52 77 Q60 70 68 77"/>
        <ellipse class="m m-wow" cx="60" cy="75" rx="4.5" ry="5.5" fill="#7a2434"/>
        <ellipse class="m-talk" cx="60" cy="74" rx="5" ry="4" fill="#7a2434" stroke="none"/>
      </g>`;
}

const wrap = (bg, inner) => `<svg viewBox="0 0 120 120" class="mira" data-mood="neutral" aria-hidden="true"><circle cx="60" cy="60" r="58" fill="${bg}"/>${inner}</svg>`;

export const AVATARS = [
  {
    id: 'mira', name: 'Mira',
    svg: () => wrap('#34305a', `
  <g class="body">
    <path d="M14 120 Q18 92 60 90 Q102 92 106 120 Z" fill="#8a5cf0"/>
    <path d="M44 91 Q60 104 76 91 L72 88 Q60 96 48 88 Z" fill="#6e44cf"/>
    <path d="M52 94 V108 M68 94 V108" stroke="#f4f6ff" stroke-width="1.6" stroke-linecap="round"/>
    <g class="head">
      <rect x="52" y="78" width="16" height="16" rx="6" fill="#e2b48f"/>
      <ellipse cx="60" cy="54" rx="26" ry="29" fill="#f1c9a5"/>
      <path d="M31 54 Q27 20 60 19 Q93 20 89 54 Q82 34 66 33 Q48 30 31 54 Z" fill="#2a2038"/>
      <path d="M60 19 Q75 18 83 28 Q70 24 62 30 Z" fill="#ff6fa8"/>
      <path d="M26 56 Q22 22 60 14 Q98 22 94 56" fill="none" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/>
      <rect x="20" y="46" width="9" height="20" rx="4.5" fill="#ffd166"/><rect x="91" y="46" width="9" height="20" rx="4.5" fill="#ffd166"/>
      ${face({ brow: '#2a2038' })}
    </g>
  </g>`),
  },
  {
    id: 'mira-brille', name: 'Mira (Brille)',
    svg: () => wrap('#27304a', `
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
      ${face({ glasses: true })}
    </g>
  </g>`),
  },
  {
    id: 'robo', name: 'Robo',
    svg: () => wrap('#1f3a4a', `
  <g class="body">
    <rect x="22" y="90" width="76" height="40" rx="14" fill="#7d93b8"/>
    <rect x="46" y="96" width="28" height="12" rx="4" fill="#2e3b57"/><circle cx="53" cy="102" r="2.2" fill="#35c98a"/><circle cx="60" cy="102" r="2.2" fill="#ffd166"/><circle cx="67" cy="102" r="2.2" fill="#ff6b6b"/>
    <g class="head">
      <rect x="55" y="80" width="10" height="12" fill="#5b6f94"/>
      <path d="M60 22 V10" stroke="#5b6f94" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="9" r="4.5" fill="#ff6b6b"/>
      <rect x="30" y="24" width="60" height="58" rx="18" fill="#a9bddf"/>
      <rect x="22" y="44" width="8" height="18" rx="4" fill="#7d93b8"/><rect x="90" y="44" width="8" height="18" rx="4" fill="#7d93b8"/>
      <rect x="35" y="38" width="50" height="34" rx="13" fill="#1d2740"/>
      ${face({ mouth: '#5de1ff', brow: '#8fd6ff', eye: '#e8fbff', pupil: '#0b3a52', cheeks: false })}
    </g>
  </g>`),
  },
  {
    id: 'fuchs', name: 'Fuchs',
    svg: () => wrap('#3b2f3f', `
  <g class="body">
    <path d="M18 120 Q22 92 60 90 Q98 92 102 120 Z" fill="#e8742c"/>
    <path d="M40 92 Q60 108 80 92 L78 100 Q60 114 42 100 Z" fill="#fff4e6"/>
    <g class="head">
      <path d="M28 40 L22 10 L48 28 Z" fill="#e8742c"/><path d="M92 40 L98 10 L72 28 Z" fill="#e8742c"/>
      <path d="M30 34 L28 17 L42 28 Z" fill="#2a1a12"/><path d="M90 34 L92 17 L78 28 Z" fill="#2a1a12"/>
      <ellipse cx="60" cy="56" rx="29" ry="28" fill="#f28a3c"/>
      <path d="M31 62 Q60 96 89 62 Q76 84 60 84 Q44 84 31 62 Z" fill="#fff4e6"/>
      <ellipse cx="60" cy="68" rx="4.2" ry="3" fill="#2a1a12"/>
      ${face({ brow: '#7a3a10', cheek: '#ffb09a', mouth: '#7a3a10' })}
    </g>
  </g>`),
  },
  {
    id: 'katze', name: 'Katze',
    svg: () => wrap('#2f3a45', `
  <g class="body">
    <path d="M18 120 Q22 92 60 90 Q98 92 102 120 Z" fill="#59b9a8"/>
    <circle cx="60" cy="100" r="3" fill="#ffd166"/>
    <g class="head">
      <path d="M30 42 L26 12 L52 30 Z" fill="#8a94a6"/><path d="M90 42 L94 12 L68 30 Z" fill="#8a94a6"/>
      <path d="M33 36 L31 20 L45 30 Z" fill="#ffb3c1"/><path d="M87 36 L89 20 L75 30 Z" fill="#ffb3c1"/>
      <ellipse cx="60" cy="56" rx="29" ry="28" fill="#a5afc0"/>
      <path d="M60 28 V38 M52 30 V38 M68 30 V38" stroke="#7d8799" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M58 66 H62 L60 69 Z" fill="#ff8fa3"/>
      <path d="M34 66 H18 M34 71 L20 76 M86 66 H102 M86 71 L100 76" stroke="#e8ebf5" stroke-width="1.3" stroke-linecap="round"/>
      ${face({ brow: '#5b6577', cheek: '#ffb3c1', mouth: '#7a3a4a' })}
    </g>
  </g>`),
  },
];

export function avatarSvg(id) { return (AVATARS.find((a) => a.id === id) || AVATARS[0]).svg(); }

export function createCoach(root, avatarId = 'mira') {
  root.classList.add('coach');
  root.innerHTML = `<div class="avatar"></div>
    <div class="bubble"><div class="bubble-text"></div><div class="bubble-actions"></div></div>`;
  const avEl = root.querySelector('.avatar');
  const textEl = root.querySelector('.bubble-text');
  const actEl = root.querySelector('.bubble-actions');
  let svg = null, mood = 'neutral', talking = false, talkTimer = null;

  function setAvatar(id) {
    avEl.innerHTML = avatarSvg(id);
    svg = avEl.querySelector('svg');
    svg.dataset.mood = mood;
    svg.classList.toggle('talking', talking);
  }
  setAvatar(avatarId);

  function anim(cls) {
    svg.classList.remove('nod', 'shake', 'bounce');
    void svg.getBoundingClientRect();
    svg.classList.add(cls);
  }

  function say(text, m = 'neutral', actions = [], effect = null) {
    mood = m; svg.dataset.mood = m;
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
    talking = true; svg.classList.add('talking');
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => { talking = false; svg.classList.remove('talking'); }, Math.min(3000, 400 + text.length * 28));
  }

  return { say, setAvatar, setMood: (m) => { mood = m; svg.dataset.mood = m; }, clearActions: () => { actEl.innerHTML = ''; } };
}

export const MOOD_FOR = { best: ['happy', 'nod'], good: ['happy', 'nod'], inacc: ['think', null], mistake: ['worry', null], blunder: ['wow', 'shake'] };
