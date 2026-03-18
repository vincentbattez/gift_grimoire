import { z } from "zod";

export const enigmaSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  haEvent: z.string(),
  question: z.string(),
  answer: z.string(),
  rune: z.string(),
  boxNumber: z.number(),
  loveLetter: z.object({
    signature: z.string(),
    message: z.string(),
  }),
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
    boxNumber: 5,
    loveLetter: {
      signature: "Le plus beau don qui existe",
      message: "Tu es Mirabel. Tu n'as besoin d'aucun pouvoir magique pour être extraordinaire — tu l'es dans chaque regard attentif, chaque mot juste, chaque moment où tu vois ce que personne d'autre ne voit.\n\nTu es celle qui répare les fissures invisibles, qui tient tout ensemble par la seule force de son cœur.\n\nEt ça, mon amour, c'est le plus beau don qui existe.",
    },
  },
  {
    id: "Y",
    title: "Les voix du ciel",
    icon: "🌅",
    haEvent: "gift_grimoire-raiponce",
    question: "Chaque année, le ciel me parle. Des centaines de voix silencieuses flottent vers moi, et je suis la seule à croire qu'elles me cherchent. Tout le monde y voit une fête. Moi, j'y vois une question",
    answer: "raiponce",
    rune: "ᚲ",
    boxNumber: 2,
    loveLetter: {
      signature: "Mon plus beau rêve éveillé",
      message: "Tu es ma Raiponce. Il y a en toi cette lumière que rien ne peut éteindre, cette curiosité qui transforme chaque jour en aventure.\n\nTu rêves les yeux ouverts, et le plus beau, c'est que tes rêves donnent envie aux autres de rêver aussi.\n\nChaque moment avec toi ressemble à ces lanternes qui s'élèvent dans le ciel — un émerveillement qui ne vieillit jamais. Tu es mon plus beau rêve, celui que je vis éveillé.",
    },
  },
  {
    id: "2g",
    title: "La danse des étoiles",
    icon: "💃",
    haEvent: "gift_grimoire-wall_e",
    question: "Il m'a invitée à danser sans un mot, sans musique, sans gravité. Sa main ne trouvait pas la mienne. Son corps partait dans le mauvais sens. Il ressemblait à tout sauf à un danseur. Mais dans ses yeux tordus, il y avait une chose que toute ma technologie ne sait pas fabriquer : l'envie d'être là, juste là, à côté de moi, même en tournant dans le vide comme un idiot magnifique",
    answer: "wall-e",
    rune: "ᚨ",
    boxNumber: 6,
    loveLetter: {
      signature: "Ma plus belle petite chose",
      message: "Comme Wall-E, tu me rappelles que l'amour, c'est simple. C'est être là, juste là, à côté de l'autre. Pas besoin d'être parfait, pas besoin de tout comprendre.\n\nJuste être présent, avec cette maladresse magnifique qui me fait fondre à chaque fois.\n\nTu m'as appris à voir la beauté dans les petites choses. Et la plus belle de toutes ces petites choses, c'est toi.",
    },
  },
  {
    id: "F",
    title: "Le cadre doré",
    icon: "🖼️",
    haEvent: "gift_grimoire-bruno",
    question: "Dans cette maison, on voit l'avenir, on guérit les corps, on déplace les montagnes. Mais le vrai miracle, c'est celui qu'on refuse de regarder, et pourtant il est juste là, à hauteur d'yeux, dans un cadre doré",
    answer: "bruno",
    rune: "ᚦ",
    boxNumber: 1,
    loveLetter: {
      signature: "Celle qui voit l'invisible",
      message: "Comme Bruno, tu possèdes ce don rare de voir au-delà des apparences. Là où les autres regardent, toi tu observes. Là où les autres entendent, toi tu écoutes vraiment.\n\nOn ne comprend pas toujours ta profondeur, et parfois ça te pèse — mais c'est exactement cette sensibilité qui fait de toi quelqu'un d'irremplaçable.\n\nTu es mon cadre doré, celle qui voit l'invisible et qui rend visible l'essentiel.",
    },
  },
  {
    id: "X",
    title: "Le poids du sourire",
    icon: "🎭",
    haEvent: "gift_grimoire-luisa",
    question: "Le jour où mon don a vacillé, je n'ai pas eu peur de souffrir. J'ai eu peur qu'on ne me regarde plus. Car ici, on ne m'aime pas pour ce que je suis, on m'aime pour ce que je soulève.",
    answer: "luisa",
    rune: "ᚢ",
    boxNumber: 3,
    loveLetter: {
      signature: "Ta force la plus belle",
      message: "Comme Luisa, tu portes le monde avec grâce. Tu es toujours là pour les autres, la première à tendre la main, la dernière à montrer que parfois, toi aussi, tu fatigues.\n\nMais je veux que tu saches quelque chose : avec moi, tu n'as pas besoin d'être forte. Tu peux tout poser.\n\nTa vulnérabilité n'est pas une faiblesse — c'est ta plus grande beauté. Et je serai toujours là pour porter avec toi.",
    },
  },
  {
    id: "2d",
    title: "La directive oubliée",
    icon: "💓",
    haEvent: "gift_grimoire-eve",
    question: "Je vole sans ailes. Je vois sans pupille. Je tue sans colère. Et j'aime sans programme. Parmi ces quatre phrases, une seule n'était pas prévue dans mes spécifications. C'est aussi la seule qui compte.",
    answer: "eve",
    rune: "ᚱ",
    boxNumber: 4,
    loveLetter: {
      signature: "Chaque matin, je te choisis",
      message: "Comme EVE, tu as cette grâce qui me désarme à chaque fois. Tu es brillante, déterminée, capable de tout — et pourtant, c'est dans tes gestes les plus doux que je te reconnais le mieux.\n\nUn regard, un sourire, une main posée sur la mienne.\n\nTu m'as appris que l'amour n'est pas écrit dans un programme — c'est un choix qu'on fait chaque matin. Et chaque matin, mon cœur te choisit.",
    },
  },
]);

