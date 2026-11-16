// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
import { toneGem } from './persona.js';
// Optionale Tiefenanalyse über die Gemini-API. Die Engine liefert die Fakten, Gemini erklärt sie nur.

const SYSTEM = (name) => `Du bist ${name || 'Mira'}, ein freundlicher Schach-Coach nach der Russischen Schule.
Dein Schüler hat etwa 200–300 Elo. Du erklärst auf Deutsch, in einfacher Sprache, kurz (höchstens 130 Wörter).
Prinzipien: kein Auswendiglernen von Zugfolgen, sondern Verstehen. Stelle zuerst 1–2 Leitfragen (Was droht? Was hängt? Schach/Schlagen/Drohung?),
erkläre dann die Idee hinter dem besten Zug in Worten. Verwende NUR die gelieferten Engine-Daten (Züge, Bewertungen, Fakten) und erfinde keine Varianten.
Keine Tabellen, keine Überschriften, höchstens 3 kurze Absätze.`;

export async function askGemini(settings, prompt, signal) {
  if (!settings.apiKey) throw new Error('Kein Gemini-API-Key hinterlegt (Einstellungen).');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(settings.model || 'gemini-flash-latest')}:generateContent`;
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  if (signal) { if (signal.aborted) throw new DOMException('abgebrochen', 'AbortError'); signal.addEventListener('abort', onAbort); }
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctl.abort(); }, 40000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.apiKey },
      signal: ctl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM(settings.coachName) + '\n' + toneGem(settings.tone) }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error?.message || `Gemini-Fehler ${r.status}`);
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    if (!text) throw new Error('Gemini hat keine Antwort geliefert.');
    return text;
  } catch (e) {
    if (e.name === 'AbortError' && timedOut) throw new Error('Gemini antwortet nicht (nach 40 Sekunden abgebrochen). Prüfe Internet und API-Key oder versuche es später nochmal.');
    throw e;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

export function moveExplainPrompt(d) {
  return `Stellung (FEN) vor dem Zug: ${d.fenBefore}
Gespielter Zug: ${d.playedSan} (${d.who})
Bewertung des Zuges: ${d.clsLabel}, Verlust ca. ${d.loss.toFixed(0)} Prozentpunkte Gewinnchance.
Engine-Bester Zug: ${d.bestSan}; Hauptvariante: ${d.pv.join(' ')}
Engine-Fakten: ${d.facts.join('; ') || 'keine besonderen'}
Erkläre dem Schüler, was hier passiert ist.`;
}

export function gameSummaryPrompt(d) {
  return `Zusammenfassung einer Partie des Schülers (${d.color}) gegen einen Bot (${d.level}). Ergebnis: ${d.result}.
Genauigkeit des Schülers: ${d.accuracy}%. Anzahl: ${d.counts}.
Kritische Momente (Zugnummer, Zug, Klasse, besserer Zug): ${d.critical.join(' | ') || 'keine'}.
Gib 3 konkrete, positive und verständliche Lernpunkte für das nächste Spiel (Russische Schule: Denkroutine statt Auswendiglernen).`;
}
