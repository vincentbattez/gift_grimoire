import { InkRevealForge } from "./forge-ink/components/InkRevealForge";
import { useInkStore } from "./forge-ink/store";
import { DarkVadorForge } from "./forge-magnet/components/DarkVadorForge";
import { useMagnetStore } from "./forge-magnet/store";
import { LetterScramble } from "./forge-scramble/components/LetterScramble";
import { useScrambleStore } from "./forge-scramble/store";
import { VibrationForge } from "./forge-vibration/components/VibrationForge";
import { useVibrationStore } from "./forge-vibration/store";
import type { ForgeModule } from "./types";

/**
 * Registre des forges pluggables.
 * Chaque forge gère son propre état (solved/revealed) dans son store local.
 */
export const FORGES: ForgeModule[] = [
  {
    key: "magnet",
    title: "La chaleur de L'Arc-en-ciel",
    successMessage:
      "Pascal changea les couleurs sombres du cœur de Dark Vador. Le seigneur des ténèbres posa enfin son sabre et sourit.",
    component: DarkVadorForge,
    useSolved: () => useMagnetStore((s) => s.solved),
    useRevealed: () => useMagnetStore((s) => s.revealed),
    solve: () => {
      useMagnetStore.getState().solve();
    },
    reveal: () => {
      useMagnetStore.getState().reveal();
    },
    reset: () => {
      useMagnetStore.getState().reset();
    },
  },
  {
    key: "scramble",
    title: "Le Maillon des Égarés",
    successMessage: "Les lettres égarées ont retrouvé leur place… Une nouvelle clé se forge dans la lumière.",
    component: LetterScramble,
    useSolved: () => useScrambleStore((s) => s.solved),
    useRevealed: () => useScrambleStore((s) => s.revealed),
    solve: () => {
      useScrambleStore.getState().solve();
    },
    reveal: () => {
      useScrambleStore.getState().reveal();
    },
    reset: () => {
      useScrambleStore.getState().reset();
    },
  },
  {
    key: "vibration",
    title: "Le Murmure Invisible",
    successMessage: "Le murmure s'est tu… mais son secret résonne encore. Une clé naît du silence.",
    component: VibrationForge,
    useSolved: () => useVibrationStore((s) => s.solved),
    useRevealed: () => useVibrationStore((s) => s.revealed),
    solve: () => {
      useVibrationStore.getState().solve();
    },
    reveal: () => {
      useVibrationStore.getState().reveal();
    },
    reset: () => {
      useVibrationStore.getState().reset();
    },
  },
  {
    key: "ink",
    title: "L'Encre Révélatrice",
    successMessage: "L'encre a tout révélé. Les mots tracés dans l'ombre brillent désormais dans ta mémoire.",
    introText:
      "Cette page du grimoire semble vide… mais tes doigts sentent les sillons d'une plume ancienne. Des mots y furent tracés à l'encre des secrets — une encre que seul un regard patient peut révéler. Verse tes gouttes avec discernement : l'encre révélatrice n'est pas inépuisable.",
    component: InkRevealForge,
    useSolved: () => useInkStore((s) => s.solved),
    useRevealed: () => useInkStore((s) => s.revealed),
    solve: () => {
      useInkStore.getState().solve();
    },
    reveal: () => {
      useInkStore.getState().reveal();
    },
    reset: () => {
      useInkStore.getState().reset();
    },
    adminActions: [
      {
        label: "reset ink drops",
        onClick: () => {
          useInkStore.getState().resetInkDrops();
        },
        color: "sky-400",
      },
    ],
  },
];
