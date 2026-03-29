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
  successFlavor: z.string(),
  loveLetter: z.object({
    signature: z.string(),
    message: z.string(),
    emojis: z.array(z.string()).min(1),
  }),
});

export type Enigma = z.infer<typeof enigmaSchema>;

export const ENIGMA_LIST: Enigma[] = z.array(enigmaSchema).parse([
  {
    id: "5",
    title: "La fissure invisible",
    icon: "🦋",
    haEvent: "gift_grimoire-mirabel",
    question: `Tout le monde ici voit l'extraordinaire sans effort. Moi, j'ai besoin d'aide pour voir l'ordinaire. Et pourtant, je suis la seule à avoir vu ce qui allait nous détruire`,
    answer: "mirabel",
    rune: "ᚠ",
    boxNumber: 5,
    successFlavor: "La fissure s'illumine… Ce qui était invisible devient évidence.",
    loveLetter: {
      emojis: ["🦋", "❤️"],
      signature: "Le plus beau don qui existe",
      message: `Comme Mirabel, tu n'as besoin d'aucun pouvoir magique pour être extraordinaire.
      
      Là où d'autres s'arrêtent, toi tu avances.
      Là où les murs se fissurent, tu poses tes mains et tu reconstruis, doucement, silencieusement, avec une force que peu de gens savent même reconnaître
      
      Tu es celle qui répare mes fissures invisibles, qui tient tout ensemble par la seule force de ton cœur.
      
      Et ça, mon amour, c'est le plus beau don qui existe.
      T'avoir à mes côtés est la chance de ma vie`,
    },
  },
  {
    id: "Y",
    title: "Les voix du ciel",
    icon: "🌅",
    haEvent: "gift_grimoire-raiponce",
    question: `Chaque année, le ciel me parle. Des centaines de voix silencieuses flottent vers moi, et je suis la seule à croire qu'elles me cherchent. Tout le monde y voit une fête. Moi, j'y vois une question`,
    answer: "raiponce",
    rune: "ᚲ",
    boxNumber: 2,
    successFlavor: "Les voix se taisent enfin, leur message t'était destiné depuis toujours.",
    loveLetter: {
      emojis: ["🏮", "💝"],
      signature: "Mon plus beau rêve éveillé",
      message: `Tu es ma Raiponce. Il y a en toi cette lumière que rien ne peut éteindre.
        
        À tes côtés, j'ai appris à rêver à nouveau. Tu m'as montré comment lever les yeux, comment voir la beauté que je laissais passer.
        
        Tes émotions et ta joie rayonne et sans que l'on s'en rende compte, elle transforme tout ce qu'elle touche.
        
        Les instants que je vis avec toi ressemblent à des lanternes qui s'élèvent dans le ciel : fragiles, lumineux, et pourtant capables d'illuminer mon ciel intérieur (qui à pourtant du mal à ressentir).
        
        Tu es mon plus beau rêve, celui que je vis éveillé.`,
    },
  },
  {
    id: "2g",
    title: "La danse des étoiles",
    icon: "💃",
    haEvent: "gift_grimoire-wall_e",
    question: `Il m'a invitée à danser sans un mot et sans musique. Sa main ne trouvait pas la mienne. Son corps partait dans le mauvais sens. Il ressemblait à tout sauf à un danseur.
      
      Ses yeux portaient ce que mes calculs ne sait pas résoudre:
      "le désir d'être là, avec lui, près de moi."`,
    answer: "wall-e",
    rune: "ᚨ",
    boxNumber: 6,
    successFlavor: "Les étoiles achèvent leur danse… et c'est toi qu'elles ont choisie.",
    loveLetter: {
      emojis: ["💃", "🤖", "❤️"],
      signature: "Ma plus belle petite chose",
      message: `Comme Wall-E, tu avances. Doucement, obstinément, même quand tout s'accumule, même quand ça pèse. Tu ne fais pas de bruit avec ta force, tu la portes, et ça se voit dans chaque chose que tu traverses sans jamais perdre ce qui te rend toi
        
      Tu me rappelles que l'amour, c'est simple. C'est être là, l'un à côté de l'autre. Pas besoin d'être celui qu'on n'est pas.
      
      Et si je devais garder une chose de toi, ce serait exactement ça: la façon dont tu m'as appris que la vie, finalement, n'a pas besoin d'être grande pour être belle`,
    },
  },
  {
    id: "F",
    title: "Le cadre doré",
    icon: "🖼️",
    haEvent: "gift_grimoire-bruno",
    question: `On m'a confondu avec une loi.
      Je suis un nom, rien qu'un nom.
      Banni, oui. Mais accroché là, bien en face, dans un cadre doré que personne ne regarde`,
    answer: "bruno",
    rune: "ᚦ",
    boxNumber: 1,
    successFlavor: "Le cadre doré révèle son secret. La vision était juste devant toi.",
    loveLetter: {
      emojis: ["🔮", "❤️"],
      signature: "Celle qui voit l'invisible",
      message: `Comme Bruno, tu vois ce que les autres ne voient pas. Par cette sensibilité profonde qui t'habite et que peu de gens savent vraiment reconnaître, tu perçois les émotions, les non-dits, les détails que personne d'autre ne remarque. Tu as ce don de voir l'invisible, de ressentir ce qui est caché.

        Tu portes beaucoup.
        Les émotions des autres s'accrochent à toi, et tu les accueilles sans te plaindre, mais je sais que ça pèse, parfois.
        Je le vois. Et j'aimerais que tu saches que je serai toujours là pour t'aider à allèger ce poids, pour te soutenir, pour t'aimer, même dans les moments où tu te sens submergée.
        
        Si seulement tu pouvais voir ce que mes yeux voient lorsqu'ils se posent sur toi, tu comprendrais enfin que tu mérites d'être fière de la femme que tu es.`,
    },
  },
  {
    id: "X",
    title: "Le poids du sourire",
    icon: "🎭",
    haEvent: "gift_grimoire-luisa",
    question: `Le jour où ma force a vacillé, je n'ai pas eu peur de souffrir. J'ai eu peur qu'on ne me regarde plus. Car ici, on ne m'aime pas pour ce que je suis, on m'aime pour ce que je soulève.`,
    answer: "luisa",
    rune: "ᚢ",
    boxNumber: 3,
    successFlavor: "Le masque tombe. Derrière le sourire, une force inébranlable.",
    loveLetter: {
      emojis: ["💪", "🌹", "❤️"],
      signature: "Ta force la plus belle",
      message: `Comme Luisa, Tu portes les autres, leurs peines, leurs besoins, leurs urgences, avec une fiabilité que tout le monde remarque sans jamais vraiment mesurer ce que ça te coûte.
        
        Tu m'as apporté c'est cette certitude rare, savoir que tu es là. Vraiment là. Inconditionnellement. Tu m'as appris ce que ça veut dire, être quelqu'un sur qui on peut compter.
        
        Alors maintenant c'est mon tour. Avec moi, tu peux tout poser. La force, le poids, les apparences.
        Ta vulnérabilité n'est pas une faiblesse, c'est la partie de toi que peu de gens connaissent, et que je chéris plus que tout.
        
        Tu as passé ta vie à être là pour les autres. Moi, je serai là pour toi. Je ne te promets pas de tout porter à ta place. Je te promets de ne jamais te laisser porter seule.
       `,
    },
  },
  {
    id: "2d",
    title: "La directive oubliée",
    icon: "💓",
    haEvent: "gift_grimoire-eve",
    question:
      "Je vole sans ailes. Je vois sans pupille. Je tue sans colère. Et j'aime sans programme. Parmi ces quatre phrases, une seule n'était pas prévue dans mes spécifications. C'est aussi la seule qui compte.",
    answer: "eve",
    rune: "ᚱ",
    boxNumber: 4,
    successFlavor: "La directive oubliée se réveille. L'amour n'a jamais eu besoin de programme.",
    loveLetter: {
      emojis: ["🤖", "❤️"],
      signature: "Chaque matin, je te choisis",
      message: `Comme EVE, tu as cette grâce qui me désarme à chaque fois. Tu es brillante, déterminée, capable de tout, et c'est quand tu n'as pas conscience de ta beauté qu'elle me frappe le plus
        
        Un regard, un sourire, une main posée sur la mienne.
        
        Tu m'as appris que l'amour n'est pas écrit dans un programme, c'est un choix qu'on fait chaque matin. Et chaque matin, mon cœur te choisit.`,
    },
  },
]);
