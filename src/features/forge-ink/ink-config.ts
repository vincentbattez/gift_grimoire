export interface WordConfig {
  text: string;
  start: [number, number]; // [row, col]
  direction: "H" | "V";
}

export interface InkForgeConfig {
  gridSize: number;
  maxDrops: number;
  maxGuessesPerWord: number;
  words: WordConfig[];
}

// Grille 9×9
// Ligne 2 : R E S O N A N C E  (RESONANCE horizontal)
//                ↑       ↑
//              ECRAN   VOILE (tous deux verticaux, partagent E en (2,1) et O en (2,3))
export const INK_CONFIG: InkForgeConfig = {
  gridSize: 9,
  maxDrops: 40,
  maxGuessesPerWord: 3,
  words: [
    { text: "RESONANCE", start: [2, 0], direction: "H" },
    { text: "ECRAN",     start: [2, 1], direction: "V" },
    { text: "VOILE",     start: [1, 3], direction: "V" },
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
