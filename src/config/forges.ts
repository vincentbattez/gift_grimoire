import type { ForgeModule } from "../types/forge";
import { DarkVadorForge } from "../features/forge-magnet/DarkVadorForge";
import { LetterScramble } from "../features/forge-scramble/LetterScramble";
import { VibrationForge } from "../features/forge-vibration/VibrationForge";

/**
 * Registre des forges pluggables.
 * Pour ajouter/retirer une forge : modifier uniquement ce fichier.
 */
export const FORGES: ForgeModule[] = [
  {
    key: "magnet",
    title: "La chaleur de L'Arc-en-ciel",
    component: DarkVadorForge,
  },
  {
    key: "scramble",
    title: "Le Maillon des Égarés",
    component: LetterScramble,
  },
  {
    key: "vibration",
    title: "Le Murmure Invisible",
    component: VibrationForge,
  },
];
