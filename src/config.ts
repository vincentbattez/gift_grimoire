import { z } from "zod";

export const enigmaSchema = z.object({
  id: z.number().int().min(1).max(6),
  title: z.string(),
  icon: z.string(),
  haEvent: z.string(),
  question: z.string(),
  answer: z.string(),
  rune: z.string(),
});

export type Enigma = z.infer<typeof enigmaSchema>;

export const ENIGMAS: Enigma[] = z.array(enigmaSchema).parse([
  {
    id: 1,
    title: "Le Sort du Feu",
    icon: "🔥",
    haEvent: "enigma_fire_solved",
    question: "Je brûle sans chaleur et danse sans jamais bouger. Qui suis-je ?",
    answer: "placeholder",
    rune: "ᚠ",
  },
  {
    id: 2,
    title: "Le Sort de l'Eau",
    icon: "💧",
    haEvent: "enigma_water_solved",
    question: "Plus je sèche, plus je suis mouillée. Que suis-je ?",
    answer: "placeholder",
    rune: "ᚢ",
  },
  {
    id: 3,
    title: "Le Sort de la Lune",
    icon: "🌙",
    haEvent: "enigma_moon_solved",
    question: "Je guide les nuits et change sans jamais partir. Qui suis-je ?",
    answer: "placeholder",
    rune: "ᚦ",
  },
  {
    id: 4,
    title: "Le Sort des Étoiles",
    icon: "⭐",
    haEvent: "enigma_stars_solved",
    question: "Je t'appartiens, mais les autres l'utilisent plus que toi. Qu'est-ce ?",
    answer: "placeholder",
    rune: "ᚨ",
  },
  {
    id: 5,
    title: "Le Sort du Vent",
    icon: "🌀",
    haEvent: "enigma_wind_solved",
    question: "Sans corps ni forme, j'ouvre les portes et chante dans les arbres.",
    answer: "placeholder",
    rune: "ᚱ",
  },
  {
    id: 6,
    title: "Le Sort Final",
    icon: "💫",
    haEvent: "enigma_final_solved",
    question: "Dernière énigme. Le secret le plus précieux. Qu'est-ce que tu es pour moi ?",
    answer: "placeholder",
    rune: "ᚲ",
  },
]);

export const HA_URL = "https://YOUR_HOME_ASSISTANT_URL";
export const HA_TOKEN = "YOUR_LONG_LIVED_ACCESS_TOKEN";
