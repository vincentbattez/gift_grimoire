export type ArcaneSymbol =
  | "crown"
  | "swords"
  | "tower"
  | "wave"
  | "star"
  | "flame"
  | "lightning"
  | "orbit"
  | "blossom"
  | "eye";

export interface EnigmaData {
  number: string;
  subtitle: string;
  title: string;
  riddle: string;
  hint: string;
  symbol: ArcaneSymbol;
}

export const ENIGMAS_DATA: EnigmaData[] = [
  {
    number: "I",
    subtitle: "Première Énigme",
    title: "L'Empire du Rêve",
    riddle:
      "Le Côté Obscur t'a mené ici, mais ta quête ne fait que commencer. Celui qui m'a donné naissance a aussi créé un royaume où une souris porte des gants blancs. Cherche les visages de ceux qui partagent son empire… ils se cachent en contrebas, près du reflet.",
    hint: "Là où la gravité entraîne le regard, la surface te renvoie ta propre quête.",
    symbol: "crown",
  },
  {
    number: "II",
    subtitle: "Deuxième Énigme",
    title: "Du Royaume Enchanté aux Lames d'Orient",
    riddle:
      "Ces visages joyeux sont nés dans un studio de rêves, mais ton prochain indice se trouve là où l'on traque des démons au rythme d'une mélodie venue d'Orient. Descends, et cherche le plus petit cadre sombre à ma gauche.",
    hint: "Le plus humble des écrins dort dans l'ombre, du côté où le soleil ne vient jamais.",
    symbol: "swords",
  },
  {
    number: "III",
    subtitle: "Troisième Énigme",
    title: "Des Démons aux Titans",
    riddle:
      "Les démons tombent un par un sous ta lame, mais que feras-tu face à des géants ? Des titans menacent l'humanité derrière des murs hauts comme le ciel. Monte tout en haut, à gauche… là où le soleil se couche sur une silhouette armée d'une épée.",
    hint: "Élève-toi jusqu'au zénith. Là où meurt la lumière, une lame veille en silence.",
    symbol: "tower",
  },
  {
    number: "IV",
    subtitle: "Quatrième Énigme",
    title: "L'Océan derrière les Murs",
    riddle:
      "Au-delà des murs, les éclaireurs ont découvert l'océan. Et si tu traversais cette mer ? Il existe une île en Méditerranée, entre l'Italie et l'Afrique, où l'eau est turquoise et les falaises vertigineuses. Cherche un cadre voisin, à ma droite, où quelqu'un pagaie en eaux claires.",
    hint: "Mon voisin de sang te montre le chemin — celui dont les bras fendent l'eau limpide.",
    symbol: "wave",
  },
  {
    number: "V",
    subtitle: "Cinquième Énigme",
    title: "D'une Île à un Miracle",
    riddle:
      "Cette île est un miracle de la nature, mais un autre miracle t'attend. Une famille colombienne vit dans une maison magique où chaque membre possède un don… sauf une. Descends vers le plus petit cadre doré, celui qui se cache à droite du reflet de vérité.",
    hint: "L'or le plus discret se terre à la droite de celui qui ne ment jamais.",
    symbol: "star",
  },
  {
    number: "VI",
    subtitle: "Sixième Énigme",
    title: "Le Don de Cuisiner",
    riddle:
      "Mirabel a prouvé qu'on n'a pas besoin de magie pour être extraordinaire. Un autre héros improbable l'a compris aussi : un minuscule chef cuisinier qui se cache sous une toque à Paris. « Tout le monde peut cuisiner ! » Cherche-le en bas, près de l'étagère, dans un cadre sombre.",
    hint: "Descends là où le savoir repose en rangées. L'ombre y garde un secret comestible.",
    symbol: "flame",
  },
  {
    number: "VII",
    subtitle: "Septième Énigme",
    title: "Du Rat sous la Toque au Rat sous la Cape",
    riddle:
      "Ce rat de Paris a un cousin célèbre. Il s'appelle Croûtard… enfin, c'est ce que tout le monde croyait. En vérité, c'est un sorcier qui a trahi ses amis. Cherche le monde de celui qui a survécu à un éclair, juste à côté de moi.",
    hint: "Tends la main sans bouger — ton prochain oracle respire à portée de souffle.",
    symbol: "lightning",
  },
  {
    number: "VIII",
    subtitle: "Huitième Énigme",
    title: "Quand les Sorciers ont quitté la Terre",
    riddle:
      "Les sorciers ont quitté la Terre bien avant que les Moldus ne la rendent inhabitable. Quand les humains sont partis aussi, il ne restait plus qu'un petit robot solitaire, compactant les déchets, attendant un amour venu des étoiles. Cherche-le dans le cadre doré, en bas à gauche.",
    hint: "L'or coule vers le nadir, du côté où l'aube se lève. Cherche celui qui attend.",
    symbol: "orbit",
  },
  {
    number: "IX",
    subtitle: "Neuvième Énigme",
    title: "De l'Amour des Étoiles à celui des Cerisiers",
    riddle:
      "Wall-E a traversé l'univers pour Eve. Mais l'amour le plus touchant est parfois le plus discret. Deux lycéens japonais se cachent mutuellement leur vrai visage : elle, sous sa froideur ; lui, sous ses tatouages. Ton trésor t'attend tout en haut, à droite, dans un cadre doré où les cerisiers sont en fleurs.",
    hint: "Au sommet, là où le crépuscule ne vient pas — des pétales éternels dorment dans l'or.",
    symbol: "blossom",
  },
  {
    number: "X",
    subtitle: "Énigme Finale",
    title: "Les Masques Tombent, le Mystère Demeure",
    riddle:
      "Félicitations ! Comme Hori et Miyamura, tu as su voir au-delà des apparences. Mais le mystère n'est pas encore résolu…\n\nDeux âmes que tout oppose se sont trouvées dans le silence de l'espace. L'un compacte, l'autre survole. Ensemble, ils ont rallumé la Terre.\n\nRetourne auprès d'eux, et frappe trois coups — comme on frappe à la porte d'un monde oublié. Toc, toc, toc… et le mystère scellé te sera révélé.",
    hint: "Le chiffre entre le silence et le bruit — frappe, et le voile se déchire.",
    symbol: "eye",
  },
];
