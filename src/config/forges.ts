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
    successMessage: "Pascal changea les couleurs sombres du cœur de Dark Vador. Le seigneur des ténèbres posa enfin son sabre et sourit.",
    component: DarkVadorForge,
  },
  {
    key: "scramble",
    title: "Le Maillon des Égarés",
    successMessage: "Les lettres égarées ont retrouvé leur place… Une nouvelle clé se forge dans la lumière.",
    component: LetterScramble,
  },
  {
    key: "vibration",
    title: "Le Murmure Invisible",
    successMessage: "Le murmure s'est tu… mais son secret résonne encore. Une clé naît du silence.",
    component: VibrationForge,
  },
];
