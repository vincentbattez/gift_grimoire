import { z } from "zod";

export const enigmaSchema = z.object({
  id: z.string(),
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
    id: "5",
    title: "La fissure invisible",
    icon: "🦋",
    haEvent: "gift_grimoire-mirabel",
    question: "Tout le monde ici voit l'extraordinaire sans effort. Moi, j'ai besoin d'aide pour voir l'ordinaire. Et pourtant, je suis la seule à avoir vu ce qui allait nous détruire",
    answer: "mirabel",
    rune: "ᚠ",
  },
  {
    id: "Y",
    title: "Les voix du ciel",
    icon: "🌅",
    haEvent: "gift_grimoire-raiponce",
    question: "Chaque année, le ciel me parle. Des centaines de voix silencieuses flottent vers moi, et je suis la seule à croire qu'elles me cherchent. Tout le monde y voit une fête. Moi, j'y vois une question",
    answer: "raiponce",
    rune: "ᚲ",
  },
  {
    id: "2g",
    title: "La danse des étoiles",
    icon: "💃",
    haEvent: "gift_grimoire-wall_e",
    question: "Il m'a invitée à danser sans un mot, sans musique, sans gravité. Sa main ne trouvait pas la mienne. Son corps partait dans le mauvais sens. Il ressemblait à tout sauf à un danseur. Mais dans ses yeux tordus, il y avait une chose que toute ma technologie ne sait pas fabriquer : l'envie d'être là, juste là, à côté de moi, même en tournant dans le vide comme un idiot magnifique",
    answer: "wall-e",
    rune: "ᚨ",
  },
  {
    id: "F",
    title: "Le cadre doré",
    icon: "🖼️",
    haEvent: "gift_grimoire-bruno",
    question: "Dans cette maison, on voit l'avenir, on guérit les corps, on déplace les montagnes. Mais le vrai miracle, c'est celui qu'on refuse de regarder, et pourtant il est juste là, à hauteur d'yeux, dans un cadre doré",
    answer: "bruno",
    rune: "ᚦ",
  },
  {
    id: "X",
    title: "Le poids du sourire",
    icon: "🎭",
    haEvent: "gift_grimoire-luisa",
    question: "Le jour où mon don a vacillé, je n'ai pas eu peur de souffrir. J'ai eu peur qu'on ne me regarde plus. Car ici, on ne m'aime pas pour ce que je suis, on m'aime pour ce que je soulève.",
    answer: "luisa",
    rune: "ᚢ",
  },
  {
    id: "2d",
    title: "La directive oubliée",
    icon: "💓",
    haEvent: "gift_grimoire-eve",
    question: "Je vole sans ailes. Je vois sans pupille. Je tue sans colère. Et j'aime sans programme. Parmi ces quatre phrases, une seule n'était pas prévue dans mes spécifications. C'est aussi la seule qui compte.",
    answer: "eve",
    rune: "ᚱ",
  },
]);

