import kpopAudio from "../../assets/audios/kpop_enigme.mp3";
import tableauxAudio from "../../assets/audios/tableaux_enigme.mp3";

export const MAX_PLAYS = 3;

export const VOICE_HINTS = [
  { key: "tableaux", src: tableauxAudio, label: "Le Fil Invisible" },
  { key: "kpop", src: kpopAudio, label: "L'Ombre" },
] as const;

export type VoiceHint = (typeof VOICE_HINTS)[number];
