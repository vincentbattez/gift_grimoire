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

export const INK_CONFIG: InkForgeConfig = {
  gridSize: 7,
  maxDrops: 40,
  maxGuessesPerWord: 3,
  words: [
    { text: "PLUME", start: [1, 1], direction: "H" }, // @todo: a remplacer par RESONANCE
    { text: "LUEUR", start: [1, 2], direction: "V" }, // @todo: a remplacer par ECRAN
    { text: "ENCRE", start: [1, 5], direction: "V" }, // @todo: a remplacer par VOILE
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
