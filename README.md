# Gift Grimoire

## Pourquoi ce projet existe

Gift Grimoire est un cadeau personnel conçu pour une seule personne. C'est un jeu d'énigmes web où chaque puzzle est construit autour d'un personnage Disney/Pixar qui reflète une facette de sa personnalité — Mirabel, Raiponce, Wall-E, Bruno, Luisa, EVE. Chaque énigme résolue révèle une lettre d'amour écrite pour elle.

Le projet n'a pas de public cible, pas de marché, pas d'utilisateurs. Il n'a qu'une héroïne.

## Problèmes qu'il résout

- **L'éphémère des cadeaux classiques.** Un cadeau matériel se pose sur une étagère. Ici, le cadeau est un parcours qui s'étale sur plusieurs jours (un essai par jour) pour prolonger la magie.

- **Le fossé entre physique et numérique.** Le projet intègre Home Assistant pour connecter des objets physiques (aimant, capteur de vibration, cartes QR) à des mécaniques in-app. Les gestes du monde réel deviennent des clés qui débloquent le jeu.

- **L'absence de sensorialité dans les web apps.** Chaque interaction dispose de 4 états visuels et sonores (idle, doing, failing, successful). Particules, animations cinématiques, champ d'étoiles, feedback haptique — la barre de qualité visée est celle d'un jeu vidéo AAA.

## Comment il fonctionne

Le projet se compose de trois parties distinctes.

### Le Grimoire — fil conducteur (route `/`)

Le grimoire est l'application principale. Il présente une grille de 6 cartes d'énigmes, toutes verrouillées au départ. L'objectif final : résoudre chaque énigme pour obtenir **le numéro d'un cadeau physique à ouvrir** dans la vraie vie.

Flow pour chaque énigme :
1. **Déverrouiller** la carte (via une Forge ou un QR code physique)
2. **Résoudre** l'énigme — deviner le personnage Disney/Pixar décrit
3. **Recevoir** le numéro de boîte cadeau à ouvrir + une lettre d'amour personnalisée

Contrainte : un seul essai par jour. Un compteur indique le temps restant avant la prochaine tentative. Quand toutes les énigmes sont résolues, une séquence de finale se déclenche.

### Les Forges — créatrices de clés

Les Forges sont des mini-puzzles indépendants dont le seul but est de **forger une clé**. Cette clé permet ensuite de déverrouiller une énigme au choix dans le grimoire.

Résoudre une forge → un picker apparaît → la joueuse choisit quelle énigme déverrouiller → animation cinématique (clé dorée glissée dans une serrure) → la carte se révèle.

Trois forges, chacune avec une mécanique différente :

| Forge | Mécanique | Capteur |
|---|---|---|
| Le Maillon des Égarés | Anagramme drag-and-drop | In-app |
| La Chaleur de l'Arc-en-ciel | Aimant physique près d'un prop Dark Vador | Home Assistant (`input_boolean`) |
| Le Murmure Invisible | Capteur de vibration | Home Assistant (`binary_sensor`) |

### Les QR codes physiques

Des cartes QR sont imprimées et dispersées dans la vraie vie. Scanner un QR code **déverrouille directement une énigme** dans le grimoire, sans passer par une forge. L'URL `?unlock=<id>` déclenche automatiquement la séquence de déverrouillage cinématique.

### La Chasse au Trésor — side project (route `/tresor`)

Un module séparé qui génère des **cartes de tarot imprimables** (95mm × 145mm) pour une chasse au trésor physique. Chaque carte contient une énigme en vers, un indice et un symbole arcane. Les énigmes forment un parcours où chaque destination mène à la suivante (Disneyland → Kpop Demon Hunter → SNK → Sardaigne → Encanto → …).

Ce module est purement destiné à l'impression — pas d'interactivité web.

## Objectifs d'expérience utilisateur

- **Immersion totale.** Aucun élément ne doit "faire web app". Le ton est poétique, chaque texte visible porte un poids narratif. L'interface est un grimoire, pas un dashboard.
- **Pont physique-digital.** Les objets réels (cartes QR, aimant, capteur) sont le point d'entrée de chaque moment magique. L'écran n'est que le miroir de ce qui se passe dans le monde physique.
- **Rythme contrôlé.** Un essai par jour force la patience, étire le plaisir sur plusieurs jours, et transforme chaque tentative en événement.
- **Récompense émotionnelle.** Chaque énigme résolue donne un numéro de cadeau physique à ouvrir et une lettre d'amour unique, lue dans une ambiance cinématique. Le jeu est un prétexte ; le vrai contenu, ce sont les mots.

## Stack technique

React 19 · TypeScript · Zustand · Tailwind CSS 4 · Vite 8 · Zod · Home Assistant REST API

## Démarrage

```bash
cp .env.example .env  # configurer VITE_HA_URL et VITE_HA_TOKEN
npm install
npm run dev
```
