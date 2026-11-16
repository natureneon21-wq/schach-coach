// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Tonalität des Coachs: Auswahl in den Einstellungen. Wirkt auf feste Coach-Texte und auf den Gemini-Prompt.
// Inhalt der Zugbewertung bleibt gleich (kommt von der Engine); nur Ansprache und Härte ändern sich.

export const TONES = {
  freundlich: {
    name: 'Freundlich', desc: 'Warm und ermutigend (Standard)',
    sample: 'Schön, dass du da bist! Wir schauen uns jede Stellung in Ruhe an.',
    gem: 'Ton: warm, freundlich und ermutigend. Sprich den Schüler mit "du" an.',
    praise: null,
    bad: { mistake: '', blunder: '' },
    end: { win: 'Schachmatt – du hast gewonnen! Glückwunsch, das war stark.', loss: 'Schachmatt. Das passiert – wichtig ist, was wir daraus lernen. Lass uns die Partie anschauen.', draw: 'Unentschieden – das ist ein ordentliches Ergebnis.' },
    start: (n, lv, c) => `Los geht's gegen den ${lv}! Du spielst ${c}. Denk bei jedem Zug an die Denk-Routine – ich schaue dir über die Schulter.`,
  },
  belehrend: {
    name: 'Belehrend', desc: 'Wie ein Lehrer: erklärt Prinzipien und Gründe',
    sample: 'Merke dir: Zuerst fragen wir, was der Gegner droht, erst dann planen wir selbst.',
    gem: 'Ton: wie ein geduldiger Schachlehrer. Nenne zu jedem Punkt das zugrunde liegende Prinzip ("Merke:"), erkläre das Warum Schritt für Schritt.',
    praise: {
      best: ['Richtig. Du hast das Prinzip angewendet: erst Drohungen prüfen, dann Kandidatenzüge vergleichen.', 'Genau so. Merke dir diese Art, die Stellung zu lesen.'],
      good: ['Vernünftig. Der Zug folgt einem guten Grundsatz, einen besseren gab es aber noch.', 'Solide. Frage dich trotzdem jedes Mal: Gibt es etwas Forcierteres?'],
      inacc: ['Das war ungenau. Merke: Prüfe immer Schach, Schlagzug, Drohung – in dieser Reihenfolge.', 'Nicht falsch, aber unpräzise. Vergleiche künftig mindestens drei Kandidatenzüge.'],
    },
    bad: { mistake: 'Lehrreich: ', blunder: 'Das ist eine Lektion: ' },
    end: { win: 'Matt – gewonnen. Analysiere trotzdem, welche Entscheidungen den Ausschlag gaben.', loss: 'Matt. Eine Niederlage ist Lernstoff: Wir suchen jetzt den Moment, an dem die Partie kippte.', draw: 'Remis. Prüfe in der Analyse, ob mehr möglich war.' },
    start: (n, lv, c) => `Heute üben wir gegen den ${lv}. Du spielst ${c}. Wende bei jedem Zug die Denk-Routine an; ich erkläre danach, was du hättest beachten sollen.`,
  },
  direkt: {
    name: 'Direkt', desc: 'Freundlich, aber ohne Umschweife',
    sample: 'Kurz und klar: Ich sage dir, was gut und was falsch war.',
    gem: 'Ton: freundlich, aber direkt. Keine Floskeln, kein Drumherumreden. Sage klar, was falsch war und was besser gewesen wäre.',
    praise: {
      best: ['Bester Zug.', 'Genau richtig.', 'Das ist der Zug.'],
      good: ['Gut.', 'Passt.', 'In Ordnung.'],
      inacc: ['Ungenau. Es gab etwas Besseres.', 'Geht, aber nicht optimal.'],
    },
    bad: { mistake: 'Das war falsch. ', blunder: 'Das war ein grober Fehler. ' },
    end: { win: 'Gewonnen. Gut gespielt.', loss: 'Verloren. Schauen wir, warum.', draw: 'Remis.' },
    start: (n, lv, c) => `Gegner: ${lv}. Du hast ${c}. Los.`,
  },
  sehrdirekt: {
    name: 'Sehr direkt', desc: 'Schonungslos ehrlich, ohne Zuckerguss (nie beleidigend)',
    sample: 'Ich sage dir ehrlich, was du falsch machst. Dafür wirst du besser.',
    gem: 'Ton: sehr direkt, schonungslos ehrlich, knapp. Benenne Fehler klar als Fehler, ohne Beschönigung und ohne Lob für Mittelmaß. Niemals beleidigend oder herabwürdigend; die Kritik gilt dem Zug, nicht der Person.',
    praise: {
      best: ['Richtig. Das war der Zug.', 'Korrekt. So gewinnt man Partien.'],
      good: ['Okay. Mehr war drin, aber kein Schaden.', 'Brauchbar. Nicht mehr.'],
      inacc: ['Schwach. Du hast nicht alle Kandidatenzüge geprüft.', 'Zu oberflächlich. Da war ein besserer Zug.'],
    },
    bad: { mistake: 'Fehler. Das hättest du sehen müssen. ', blunder: 'Patzer. Du hast nicht geprüft, was der Gegner damit macht. ' },
    end: { win: 'Gewonnen. Gegen diesen Gegner ist das das Minimum – such dir bald einen stärkeren.', loss: 'Verloren. Die Analyse zeigt dir gleich, wo du es verschenkt hast.', draw: 'Remis. Das war wohl mehr drin.' },
    start: (n, lv, c) => `${lv}. Du spielst ${c}. Denk nach, bevor du ziehst – ich sage dir hinterher ehrlich, was du übersehen hast.`,
  },
  motivierend: {
    name: 'Motivierend', desc: 'Begeistert, feiert jeden Fortschritt',
    sample: 'Du packst das! Jede Partie macht dich besser.',
    gem: 'Ton: sehr motivierend und begeistert, feiere Fortschritte, formuliere Fehler als Chancen zum Lernen.',
    praise: {
      best: ['Wooow, perfekt gesehen! Genau so wirst du stark!', 'Das war Spitzenklasse! Weiter so!'],
      good: ['Schöner Zug! Du bist auf einem richtig guten Weg!', 'Das sieht gut aus – dein Gefühl für die Stellung wächst!'],
      inacc: ['Fast! Das ist eine tolle Gelegenheit zum Dazulernen.', 'Gar nicht schlecht! Mit etwas mehr Prüfen holst du noch mehr raus.'],
    },
    bad: { mistake: 'Kein Problem, genau dafür üben wir! ', blunder: 'Passiert den Besten! Jetzt lernen wir daraus. ' },
    end: { win: 'JAAA, gewonnen! Das hast du dir verdient!', loss: 'Das war ein toller Kampf! Aus dieser Partie holen wir jetzt richtig viel raus.', draw: 'Remis – stark gekämpft!' },
    start: (n, lv, c) => `Auf geht's gegen den ${lv}! Du spielst ${c}. Du schaffst das, ich bin an deiner Seite!`,
  },
  sachlich: {
    name: 'Sachlich', desc: 'Nüchtern und neutral, nur Fakten',
    sample: 'Ich bewerte die Züge neutral und nenne nur die Fakten.',
    gem: 'Ton: nüchtern, neutral und sachlich. Keine Emotionen, kein Lob, keine Wertung außer der Bewertung des Zuges.',
    praise: {
      best: ['Bester Zug laut Engine.', 'Entspricht der Engine-Empfehlung.'],
      good: ['Guter Zug.', 'Zug im Rahmen der besten Optionen.'],
      inacc: ['Ungenauigkeit. Die Engine bevorzugt einen anderen Zug.', 'Leichter Bewertungsverlust.'],
    },
    bad: { mistake: 'Deutlicher Bewertungsverlust. ', blunder: 'Sehr großer Bewertungsverlust. ' },
    end: { win: 'Partie beendet: Sieg.', loss: 'Partie beendet: Niederlage.', draw: 'Partie beendet: Remis.' },
    start: (n, lv, c) => `Partie gegen ${lv}. Farbe: ${c}.`,
  },
};

export const tone = (id) => TONES[id] || TONES.freundlich;
export const toneGem = (id) => tone(id).gem;
