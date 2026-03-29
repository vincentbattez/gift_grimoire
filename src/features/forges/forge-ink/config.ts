export type WordConfig = {
  text: string;
  startList: [number, number]; // [row, col]
  direction: "H" | "V";
};

type InkForgeConfig = {
  gridCols: number;
  gridRows: number;
  maxDrops: number;
  maxGuessesPerWord: number;
  wordList: WordConfig[];
};

// Grille 7 colonnes × 9 lignes (mobile-safe)
// Col 3 : RESONANCE verticale
// Ligne 0 : ECRAN horizontal — partage R avec RESONANCE en (0,3)
// Ligne 3 : VOILE horizontal — partage O avec RESONANCE en (3,3)
//
//  color:  0 1 2 3 4 5 6
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
  maxDrops: 6,
  maxGuessesPerWord: 3,
  wordList: [
    { text: "RESONANCE", startList: [0, 3], direction: "V" },
    { text: "ECRAN", startList: [0, 1], direction: "H" },
    { text: "VOILE", startList: [3, 2], direction: "H" },
  ],
};

/** Map "row,col" → { letter, wordTextList[] } */
function buildLetterMap(config: InkForgeConfig): Map<string, { letter: string; wordTextList: string[] }> {
  const map = new Map<string, { letter: string; wordTextList: string[] }>();
  for (const word of config.wordList) {
    for (let i = 0; i < word.text.length; i++) {
      const row = word.direction === "H" ? word.startList[0] : word.startList[0] + i;
      const color = word.direction === "H" ? word.startList[1] + i : word.startList[1];
      const key = `${String(row)},${String(color)}`;
      const entry = map.get(key);

      if (entry) {
        entry.wordTextList.push(word.text);
      } else {
        map.set(key, { letter: word.text[i], wordTextList: [word.text] });
      }
    }
  }

  return map;
}

/** Get all [row, col] cells for a word, in order */
export function getWordCells(word: WordConfig): [number, number][] {
  return Array.from(
    { length: word.text.length },
    (_, i) =>
      [
        word.direction === "H" ? word.startList[0] : word.startList[0] + i,
        word.direction === "H" ? word.startList[1] + i : word.startList[1],
      ] as [number, number],
  );
}

// ── Derived constants ─────────────────────────────────────────────────────

export type WordState = { solved: boolean; guessesLeft: number };

/** Map "row,col" → { letter, wordTextList[] } — pre-computed at module load */
export const LETTER_MAP = buildLetterMap(INK_CONFIG);

function computeProximityMap(): Map<string, "hot" | "warm"> {
  const map = new Map<string, "hot" | "warm">();
  for (let r = 0; r < INK_CONFIG.gridRows; r++) {
    for (let c = 0; c < INK_CONFIG.gridCols; c++) {
      const key = `${String(r)},${String(c)}`;

      if (LETTER_MAP.has(key)) {
        continue;
      }
      let minDist = Infinity;
      for (const lk of LETTER_MAP.keys()) {
        const [lr, lc] = lk.split(",").map(Number);
        const dist = Math.abs(r - lr) + Math.abs(c - lc);

        if (dist < minDist) {
          minDist = dist;
        }
      }

      if (minDist === 1) {
        map.set(key, "hot");
      } else if (minDist === 2) {
        map.set(key, "warm");
      }
    }
  }

  return map;
}

/** Distance de chaque case vide à la lettre la plus proche */
export const PROXIMITY_MAP = computeProximityMap();
