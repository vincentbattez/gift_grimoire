# Performance Review - Refactoring Architecture Modulaire

**Diff analysed:** `769ba057..HEAD` (2 commits: refactor + ESLint fixes)
**Fichiers modifies:** 18 (720 ajouts, 1118 suppressions)
**Date:** 2026-03-25

---

## Score global : 6/10

Le refactoring est structurellement sain (bonne decomposition, registre pluggable des forges, types partages). Mais plusieurs problemes de performance non resolus persistent, et le refactoring en a introduit de nouveaux.

---

## CRITIQUE - Problemes de performance detectes

### P1. `useCountdown()` tourne en permanence meme quand il n'est pas necessaire

**Fichiers:** `src/hooks/useCountdown.ts`, `src/features/forge-magnet/DarkVadorForge.tsx`, `src/components/EnigmaModal.tsx`

Le hook `useCountdown()` demarre un `setInterval(tick, 1000)` **inconditionnellement** a chaque montage, meme quand le countdown n'est pas affiche. Dans `DarkVadorForge`, le hook est appele en haut du composant (ligne 34) alors que le countdown n'est visible que dans un cas precis (quand `!isChecking && !showPicker && countdown`). Le timer tourne donc pour rien dans 90% des cas.

Pire, dans `ModalBody`, le hook est appele meme quand `attemptUsed` est `false` (aucun countdown n'est affiche).

**Impact:** 1 re-render/seconde par composant monte inutilement. Avec `DarkVadorForge` + `ModalBody` montes, ca fait 2 timers parasites.

**Avant le refactoring**, le countdown dans `EnigmaModal` etait conditionnel (`if (!attemptUsed) return;` dans le `useEffect`). Le refactoring a **supprime cette garde** en deplacant la logique dans un hook generique sans condition.

```ts
// useCountdown.ts - L'ancien code avait une garde:
// useEffect(() => {
//   if (!attemptUsed) return;  // <-- SUPPRIME lors du refactoring
//   ...
// }, [attemptUsed]);

// Nouveau code: aucune condition, tourne toujours
export function useCountdown(): string {
  useEffect(() => {
    function tick() { ... }
    tick();
    const id = setInterval(tick, 1_000); // Tourne meme si invisible
    return () => clearInterval(id);
  }, []);
  return label;
}
```

**Correction:** Ajouter un parametre `enabled: boolean` au hook, ou remonter la logique conditionnelle.

```ts
export function useCountdown(enabled = true): string {
  useEffect(() => {
    if (!enabled) return;
    // ...
  }, [enabled]);
}
```

---

### P2. Inline closures recreees a chaque render dans `ForgeSection`

**Fichier:** `src/components/ForgeSection.tsx`, lignes 56 et 132

```tsx
<ForgeComponent solved={solved} onSolve={() => solveForge(key)} />
```

Cette lambda `() => solveForge(key)` est recree a chaque render. Comme `ForgeComponent` est un composant potentiellement couteux (DarkVadorForge contient des SVG animees, des Audio elements, etc.), chaque changement de state dans `ForgeSection` force un re-render complet du composant enfant.

La lambda est creee **deux fois** dans le composant: lignes 56 (branche revealed) et 132 (branche locked). Idem pour `resetForge` ligne 67.

**Impact:** Re-renders inutiles des forges a chaque changement de `phase` dans le processus de deverrouillage.

**Correction:** `useCallback` ou mieux, stocker la callback dans un ref stable.

```tsx
const handleSolve = useCallback(() => solveForge(key), [solveForge, key]);
```

---

### P3. `RUNE_DATA` utilise `Math.random()` au module-scope

**Fichier:** `src/components/ForgeSection.tsx`, lignes 12-16

```ts
const RUNE_DATA = RUNE_GLYPHS.map((_, i) => ({
  angle: (Math.PI * 2 / RUNE_GLYPHS.length) * i,
  dist: 60 + Math.random() * 40,
  rot: Math.random() * 360,
}));
```

`Math.random()` au module-scope produit des valeurs differentes a chaque chargement. C'est une amelioration par rapport a l'ancien code (ou le random etait dans le render), mais c'est aussi un piege: ce code n'est **pas deterministe** pour le SSR/hydration si on y migre un jour. De plus, les valeurs sont fixees a l'import -- pas a l'instance. Si deux `ForgeSection` etaient montees simultanement, elles partageraient les memes `RUNE_DATA`.

**Impact:** Faible dans le contexte actuel (CSR uniquement). Mais c'est un pattern fragile.

---

### P4. `DoubtOverlay` est toujours dans le DOM meme quand invisible

**Fichier:** `src/components/DoubtOverlay.tsx`

Le composant render toujours ses deux `<div>` principaux (backdrop + panel), meme quand `visible === false`. Ils sont masques par `opacity-0 pointer-events-none`, mais:
- Le backdrop a `backdropFilter: "blur(8px)"` qui est couteux en GPU.
- Le browser doit quand meme layouter et painter ces elements.
- Les animations CSS conditionnelles (`{visible && ...}` pour les particules) sont bonnes, mais le conteneur parent reste monte.

**Impact:** Le `backdropFilter: blur` est l'un des effets CSS les plus couteux. Meme a `opacity: 0`, certains navigateurs le composent quand meme.

**Correction:** Ne pas monter le composant quand il est invisible, ou utiliser `display: none` au lieu de `opacity: 0`.

---

### P5. Multiples selectors Zustand granulaires mais non-memoises

**Fichier:** `src/components/ForgeSection.tsx`, lignes 32-36

```tsx
const revealed = useStore((s) => s.forgeRevealed[key]);
const revealForge = useStore((s) => s.revealForge);
const solved = useStore((s) => s.forges[key] ?? false);
const solveForge = useStore((s) => s.solveForge);
const resetForge = useStore((s) => s.resetForge);
```

Cinq appels `useStore` separees. Pour les fonctions (`revealForge`, `solveForge`, `resetForge`), les references sont stables dans Zustand (OK). Mais `s.forgeRevealed[key]` et `s.forges[key] ?? false` creent des selecteurs qui dependent de `key` -- c'est correct mais le `?? false` cree une reference differente a chaque render si la cle n'existe pas (undefined vs false via `??`). Zustand fait un `Object.is` pour la comparaison, et `undefined !== false`, donc le premier render force toujours un update.

**Impact:** Mineur (un re-render supplementaire au montage).

---

### P6. `EnigmaGrid` re-subscribe au store entier via `enigmas`

**Fichier:** `src/components/EnigmaGrid.tsx`, lignes 80 et 121-122

```tsx
// EnigmaSection
const enigmas = useStore((s) => s.enigmas);

// EnigmaGrid
const enigmas = useStore((s) => s.enigmas);
const prologueCompleted = Object.values(enigmas).some((e) => e.unlocked || e.solved);
```

`enigmas` est un objet complet. Toute modification d'une seule enigme (unlock, solve, relock) declenche un re-render de **tout** `EnigmaGrid` et de `EnigmaSection`. Comme `enigmas` est recree a chaque mutation Zustand (spread operator `{ ...s.enigmas, [id]: ... }`), la reference change a chaque fois.

Le `FinaleButton` fait pareil:
```tsx
const enigmas = useStore((s) => s.enigmas);
const allSolved = Object.values(enigmas).every((e) => e.solved);
```

**Impact:** Chaque solve/unlock force un re-render en cascade de: `EnigmaGrid` -> `EnigmaSection` -> `FinaleButton` -> tous les `EnigmaCard` -> toutes les `ForgeSection`.

**Correction:** Selectionner plus finement:
```tsx
const prologueCompleted = useStore((s) =>
  Object.values(s.enigmas).some((e) => e.unlocked || e.solved)
);
const solvedCount = useStore((s) =>
  Object.values(s.enigmas).filter((e) => e.solved).length
);
```

---

### P7. Pas de lazy loading pour les forges et modales

**Fichiers:** `src/config/forges.ts`, `src/App.tsx`

Tous les composants forge sont importes statiquement dans `forges.ts`:
```ts
import { DarkVadorForge } from "../features/forge-magnet/DarkVadorForge";
import { LetterScramble } from "../features/forge-scramble/LetterScramble";
import { VibrationForge } from "../features/forge-vibration/VibrationForge";
```

Ces imports tirent avec eux l'audio (`darkVadorSrc` -- un fichier MP3), les modules HA, etc. Ils sont charges meme si l'utilisateur n'a pas encore atteint la section "La Forge des Cles".

De meme, `App.tsx` importe statiquement `FinaleModal`, `LoveLetterModal`, `IntroModal`, `SuccessModal` -- des modales lourdes qui ne sont montrees que conditionnellement.

**Impact:** Bundle initial plus gros que necessaire. `FinaleModal` seul fait ~1100 lignes de composant.

**Correction:** Utiliser `React.lazy()` pour les forges et les modales:
```ts
const FinaleModal = lazy(() => import("./components/FinaleModal"));
const LoveLetterModal = lazy(() => import("./components/LoveLetterModal"));
```

Pour les forges, le pattern pluggable actuel le rend facile:
```ts
export const FORGES: ForgeModule[] = [
  {
    key: "magnet",
    title: "...",
    component: lazy(() => import("../features/forge-magnet/DarkVadorForge")),
  },
  // ...
];
```

---

### P8. `new Audio()` cree a chaque appel dans `DarkVadorForge.playAudio()`

**Fichier:** `src/features/forge-magnet/DarkVadorForge.tsx`, ligne 37

```tsx
async function playAudio() {
  const audio = new Audio(darkVadorSrc);
  setIsPlaying(true);
  audio.addEventListener("ended", () => { ... });
  await audio.play();
}
```

Chaque appel cree un nouvel objet `Audio`. Pas de cleanup si le composant demonte pendant la lecture. L'element audio survit en memoire jusqu'a la fin de la lecture, puis le GC le collecte -- mais si le composant est demonte, `setIsPlaying(false)` est appele sur un composant demonte (pas de cancellation).

**Impact:** Fuite memoire potentielle si navigation pendant la lecture. Pas de possibilite de pause/reprise.

**Correction:** Stocker l'`Audio` dans un `useRef` et cleanup dans le return du `useEffect`.

---

### P9. `AttemptBadge` dans `App.tsx` duplique le pattern countdown

**Fichier:** `src/App.tsx`, lignes 47-66

Le composant `AttemptBadge` reimplemente le countdown manuellement au lieu d'utiliser le nouveau hook `useCountdown()`. C'est du code duplique qui a echappe au refactoring.

```tsx
// App.tsx - AttemptBadge (NON refactore)
useEffect(() => {
  if (!attemptUsed) return;
  function tick() {
    const ms = msUntilMidnight();
    // ... formatage identique
  }
  tick();
  const id = setInterval(tick, 1_000);
  return () => clearInterval(id);
}, [attemptUsed]);
```

**Impact:** Code duplique. Mais au moins ce code conserve la garde `if (!attemptUsed) return` que le hook `useCountdown` a perdue (voir P1).

---

### P10. Overlay click handler recree a chaque render

**Fichier:** `src/components/EnigmaModal.tsx`, ligne 331

```tsx
onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
```

L'ancienne version avait une fonction `handleOverlayClick` nommee. La nouvelle inline lambda est recree a chaque render. Mineur, mais systematique -- c'est le pattern repete partout dans ce refactoring de "condenser les lignes".

---

## Re-renders inutiles (resume)

| Composant | Cause | Severite |
|-----------|-------|----------|
| `DarkVadorForge` | `useCountdown()` sans garde, 1 render/sec | Haute |
| `ModalBody` | `useCountdown()` sans garde, 1 render/sec meme si countdown pas affiche | Haute |
| `EnigmaGrid` + enfants | Selecteur `s.enigmas` non-granulaire | Moyenne |
| `ForgeSection` | Inline closures `onSolve` recreees | Moyenne |
| `FinaleButton` | Selecteur `s.enigmas` complet | Faible |
| `EnigmaModal` overlay | Inline `onClick` recree | Faible |

---

## Optimisations manquantes

1. **Aucun `React.memo`** sur les composants enfants (`EnigmaCard`, `ForgeSection`, `WideWaveform`, `SoundWaveIcon`). Dans un arbre de ~10+ composants enfants, c'est un manque.

2. **Aucun `useMemo`** pour les calculs derives (`allSolved`, `solvedCount`, `prologueCompleted`). Ces valeurs sont recalculees a chaque render.

3. **Pas de `will-change`** sur les elements frequemment animes (`ForgeSection` pendant les phases, `DoubtOverlay` backdrop). Le navigateur ne peut pas optimiser la composition GPU a l'avance.

4. **`WideWaveform`** render 32 `<rect>` SVG a chaque render sans memo. Les props (`playing`, `color`) changent rarement -- un `React.memo` est trivial ici.

5. **Pas de debounce** sur le `setInterval` de 50ms dans `VibrationForge` (progress bar). 20 renders/seconde pour une barre de progression est excessif. 100-200ms suffirait visuellement.

---

## Impact sur le bundle size

### Positif
- Reduction nette: **-398 lignes** (-1118 ajouts / +720 suppressions). Le code est plus compact.
- Extraction de `WideWaveform` en composant reutilisable evite la duplication.
- Les types partages (`ForgeProps`, `ForgeModule`) sont legers.

### Negatif
- **Aucun lazy loading** -- tous les composants sont charges upfront.
- L'import statique de `darkVadorSrc` (MP3) dans `forges.ts` -> `DarkVadorForge` tire le fichier audio dans le bundle initial.
- `html-to-image` et `zod` dans les dependencies: ni l'un ni l'autre ne semble utilise dans les fichiers modifies. S'ils ne sont pas tree-shakes correctement, c'est du poids mort.
- Le changement de `grimoire_v3` a `grimoire_v4` dans le localStorage name casse le cache local de tous les utilisateurs existants, mais c'est une regression fonctionnelle, pas de performance.

---

## Fuites memoire potentielles

1. **`DarkVadorForge.playAudio()`** : `new Audio()` sans ref ni cleanup. Si le composant demonte pendant la lecture, le callback `ended` appelle `setIsPlaying` et `recordDarkVadorPlay` sur un composant demonte.

2. **`LetterScramble` event listeners** : Les `document.addEventListener("pointermove/pointerup")` dans `handlePointerDown` sont correctement nettoyes dans `onUp`, mais si le composant est demonte pendant un drag, `onUp` ne sera jamais appele. Les listeners persistent.

3. **`EnigmaModal.startSuspenseTimer()`** : `setInterval` et `setTimeout` stockes dans `suspenseRef`, mais pas de cleanup dans un `useEffect` return. Si le composant est demonte pendant le suspense, les timers continuent et appellent `setSuspenseProgress` / `resolve()` sur un composant demonte.

---

## Recommandations concretes (par priorite)

### Haute priorite

1. **Ajouter `enabled` a `useCountdown`** et ne l'activer que quand le countdown est visible.

2. **Lazy-loader les modales** (`FinaleModal`, `LoveLetterModal`, `SuccessModal`, `IntroModal`) avec `React.lazy` + `Suspense`.

3. **Nettoyer les timers** dans `EnigmaModal` : ajouter un `useEffect` cleanup pour `suspenseRef`.

4. **Nettoyer l'Audio** dans `DarkVadorForge` : stocker dans un `useRef`, ajouter un cleanup.

### Moyenne priorite

5. **Selecteurs Zustand granulaires** : remplacer `useStore((s) => s.enigmas)` par des selecteurs derives pour `solvedCount`, `allSolved`, `prologueCompleted`.

6. **`React.memo`** sur `WideWaveform`, `SoundWaveIcon`, `EnigmaCard`, `ForgeSection`.

7. **`useCallback`** pour `onSolve` dans `ForgeSection`.

8. **Reduire la frequence** du `setInterval` dans `VibrationForge` progress (50ms -> 150ms).

### Basse priorite

9. **Utiliser `useCountdown`** dans `AttemptBadge` (App.tsx) pour eliminer la duplication.

10. **Conditionner le montage** de `DoubtOverlay` (ne pas render quand `!visible`) au lieu de cacher avec `opacity: 0`.

11. **Lazy-loader les forges** dans `config/forges.ts` via `React.lazy`.

12. **Auditer** `html-to-image` et `zod` dans `package.json` -- s'ils ne sont pas utilises dans le code principal, les deplacer en devDependencies ou les retirer.

---

## Deeper

**Blind spots:**
1. Le pattern `setInterval(tick, 50)` pour les progress bars est repete dans 3 endroits (VibrationForge, EnigmaModal suspense, EnigmaModal suspenseTimer). Pourquoi ne pas extraire un hook `useProgress(durationMs)` ? [extraire | laisser]
2. Le `stopSoundRef` pattern (store une cleanup function dans un ref) est repete dans VibrationForge et EnigmaModal. Un hook `useDisposable` couvrirait les deux. [creer le hook | ignorer]
3. Aucun des composants n'utilise `React.Profiler` ou les React DevTools Profiler markers. Comment mesurer les re-renders en production ? [ajouter profiling | pas necessaire]

**Deeper:**
4. Avec le registre `FORGES[]`, pourquoi ne pas aller jusqu'a un systeme de lazy-loading par forge avec un skeleton placeholder pendant le chargement ? [implementer | premature]
5. Le store Zustand persiste tout dans un seul document localStorage. Avec la migration `v3` -> `v4`, les donnees existantes sont perdues. Faut-il un systeme de migration ? [ajouter migration | casser le cache est OK]
6. Les animations CSS (doubt-orbit, forge-border-glow, etc.) sont definies quelque part en CSS global. Sont-elles tree-shaked si non utilisees ? [verifier | non pertinent avec Tailwind]

**Risks:**
7. `RUNE_DATA` avec `Math.random()` au module-scope : si on active le SSR un jour, l'hydration va diverger. Faut-il pre-generer les valeurs ? [fixer maintenant | dette acceptable]
8. Le changement localStorage `grimoire_v3` -> `grimoire_v4` va reset le state de tous les utilisateurs actifs. Est-ce intentionnel ? [ajouter migration | c'est voulu]
9. L'absence de cleanup des event listeners dans `LetterScramble` lors d'un unmount pendant un drag : sur mobile, c'est un scenario reel (navigation arriere pendant un drag). [fixer | peu probable]
