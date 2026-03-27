export interface WordConfig {
  text: string;
  start: [number, number]; // [row, col]
  direction: "H" | "V";
}

export interface InkForgeConfig {
  gridCols: number;
  gridRows: number;
  maxDrops: number;
  maxGuessesPerWord: number;
  words: WordConfig[];
}

// Grille 7 colonnes × 9 lignes (mobile-safe)
// Col 3 : RESONANCE verticale
// Ligne 0 : ECRAN horizontal — partage R avec RESONANCE en (0,3)
// Ligne 3 : VOILE horizontal — partage O avec RESONANCE en (3,3)
//
//  col:  0 1 2 3 4 5 6
//  row0:   E C R A N
//  row1:       E
//  row2:       S
//  row3:   V O I L E  ← VOILE (partage O en (3,3) car RESONANCE[3]=O)
//  row4:       N
//  row5:       A
//  row6:       N
//  row7:       C
//  row8:       E
export const INK_CONFIG: InkForgeConfig = {
  gridCols: 7,
  gridRows: 9,
  maxDrops: 40,
  maxGuessesPerWord: 3,
  words: [
    { text: "RESONANCE", start: [0, 3], direction: "V" },
    { text: "ECRAN",     start: [0, 1], direction: "H" },
    { text: "VOILE",     start: [3, 2], direction: "H" },
  ],
};

/** Map "row,col" → { letter, wordTexts[] } */
export function buildLetterMap(
  config: InkForgeConfig,
): Map<string, { letter: string; wordTexts: string[] }> {
  const map = new Map<string, { letter: string; wordTexts: string[] }>();
  for (const word of config.words) {
    for (let i = 0; i < word.text.length; i++) {
      const row = word.direction === "H" ? word.start[0] : word.start[0] + i;
      const col = word.direction === "H" ? word.start[1] + i : word.start[1];
      const key = `${row},${col}`;
      const entry = map.get(key);
      if (entry) {
        entry.wordTexts.push(word.text);
      } else {
        map.set(key, { letter: word.text[i], wordTexts: [word.text] });
      }
    }
  }
  return map;
}

/** Get all [row, col] cells for a word, in order */
export function getWordCells(word: WordConfig): [number, number][] {
  return Array.from({ length: word.text.length }, (_, i) => [
    word.direction === "H" ? word.start[0] : word.start[0] + i,
    word.direction === "H" ? word.start[1] + i : word.start[1],
  ] as [number, number]);
}
