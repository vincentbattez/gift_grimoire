# Revue de securite - gift_grimoire

**Scope**: Changements entre `769ba057` et `HEAD` (commits `1395ce2`, `8525d02`)
**Date**: 2026-03-25
**Analyste**: Claude Opus 4.6
**Branche**: `vk/a2e5-refactor-archite`

---

## Score global: 6/10

Le refactoring est principalement structurel (extraction de composants, modularisation des forges). Il n'introduit pas de nouvelles surfaces d'attaque majeures mais ne corrige pas non plus les vulnerabilites pre-existantes significatives du projet. Les problemes les plus critiques sont anterieurs au diff mais restent presents dans le code touche.

---

## Vulnerabilites detectees

### CRITIQUE

#### V-01: Token Home Assistant expose cote client (pre-existant, toujours present)
- **Fichier**: `/src/env.ts` (ligne 13), `/src/ha.ts` (lignes 6-8, 50-54)
- **Type**: Exposition de secrets / CWE-798
- **Severite**: CRITIQUE
- **OWASP**: A07:2021 - Identification and Authentication Failures
- **Detail**: Le token Home Assistant (`HA_TOKEN`) est injecte via `import.meta.env.VITE_HA_TOKEN` et embarque dans le bundle JavaScript client. Tout utilisateur ouvrant les DevTools peut extraire ce token JWT longue duree (`exp: 2089092581`, soit ~63 ans de validite). Ce token donne un acces complet a l'API Home Assistant.
- **Impact**: Acces total a toutes les entites Home Assistant, controle de la domotique, lecture des donnees personnelles.
- **Lien avec le diff**: Le diff ne modifie pas `ha.ts` mais les composants refactores (`DarkVadorForge`, `VibrationForge`) continuent d'utiliser `getEntityState()` et `pollEntityState()` qui transportent ce token.
- **Recommandation**: Creer un proxy backend minimaliste (ex: Cloudflare Worker, Netlify Function) qui expose uniquement les endpoints necessaires (`/api/states/{entity_id}` en lecture pour les entites specifiques). Le token ne doit jamais etre dans le bundle client.

#### V-02: Reponses aux enigmes en clair dans le bundle client
- **Fichier**: `/src/config.ts` (lignes 30, 56, 85-86, 109, 132, 158)
- **Type**: Exposition de donnees sensibles / CWE-312
- **Severite**: CRITIQUE (pour la logique metier du jeu)
- **OWASP**: A01:2021 - Broken Access Control
- **Detail**: Toutes les reponses aux enigmes (`mirabel`, `raiponce`, `wall-e`, `bruno`, `luisa`, `eve`) sont en clair dans `config.ts`. La solution du scramble (`HWHRESSKDS`) est egalement en clair dans `/src/features/forge-scramble/LetterScramble.tsx` (ligne 6). N'importe quel joueur peut ouvrir les DevTools > Sources et trouver toutes les reponses.
- **Impact**: Le jeu entier peut etre resolu en 30 secondes via les DevTools.
- **Lien avec le diff**: Le diff deplace `LetterScramble.tsx` mais ne modifie pas l'exposition de `SOLUTION`. Le `normalize()` dans `EnigmaModal.tsx` fait la comparaison cote client, confirmant que la validation est entierement locale.
- **Recommandation**: Hasher les reponses (SHA-256 du texte normalise) et comparer les hash cote client. Ou mieux : valider cote serveur.

### HAUTE

#### V-03: Mode admin sans authentification
- **Fichier**: `/src/useAdmin.ts` (lignes 15-22), `/src/components/EnigmaGrid.tsx` (lignes 53-73 - modifie dans ce diff)
- **Type**: Broken Access Control / CWE-284
- **Severite**: HAUTE
- **OWASP**: A01:2021 - Broken Access Control
- **Detail**: Le mode admin s'active via `?admin=true` dans l'URL. Aucun mot de passe, aucun token, aucune verification. Le flag est persiste en `localStorage`. Le diff modifie `AdminControls` (lignes 53-73) pour utiliser le nouveau systeme de forges (`FORGES.forEach`) mais ne renforce pas l'authentification.
- **Impact**: N'importe qui peut acceder au mode admin via `?admin=true`, debloquer toutes les enigmes, resoudre toutes les forges, relancer les epreuves.
- **Recommandation**: Ajouter au minimum un mot de passe (hash compare cote client) ou un token secret dans l'URL (`?admin=<secret>`).

#### V-04: QR Code unlock sans validation
- **Fichier**: `/src/App.tsx` (lignes 34-44 - non modifie dans ce diff mais utilise par le code modifie)
- **Type**: Parameter Tampering / CWE-639
- **Severite**: HAUTE
- **OWASP**: A01:2021 - Broken Access Control
- **Detail**: Le parametre URL `?unlock=<id>` declenche directement `triggerUnlockEffect()`. Un utilisateur peut deviner ou bruteforcer les ID d'enigmes (`5`, `Y`, `2g`, `F`, `X`, `2d`) pour les debloquer sans scanner le QR code physique.
- **Impact**: Contournement complet du mecanisme de QR code physique.
- **Recommandation**: Utiliser des tokens HMAC a usage unique lies aux QR codes, ou au minimum des UUID v4 non previsibles comme identifiants.

### MOYENNE

#### V-05: Reset des tentatives accessible a tous
- **Fichier**: `/src/App.tsx` (lignes 130-134)
- **Type**: Broken Access Control / CWE-284
- **Severite**: MOYENNE
- **OWASP**: A01:2021 - Broken Access Control
- **Detail**: Le bouton "reset" (ligne 131) est present pour tous les utilisateurs (pas uniquement admin), permettant de reinitialiser `lastAttempt`, `darkVadorPlayedAt`, et `audioPlayCounts`. Il est stylise pour etre quasi-invisible (`text-muted/20`, `cursor-default`) mais reste interactif.
- **Impact**: Un utilisateur decouvrant ce bouton peut contourner la limitation d'une tentative par jour.
- **Recommandation**: Conditionner ce bouton a `isAdmin` ou le supprimer.

#### V-06: Etat du jeu entierement manipulable via localStorage
- **Fichier**: `/src/store.ts` (lignes 193-205 - modifie dans ce diff)
- **Type**: Client-Side State Tampering / CWE-602
- **Severite**: MOYENNE
- **OWASP**: A04:2021 - Insecure Design
- **Detail**: Le diff change le nom du store de `grimoire_v3` a `grimoire_v4` et restructure `partialize()`. Tout l'etat du jeu (enigmes resolues, forges completees, tentatives) est persiste en `localStorage` sous la cle `grimoire_v4`. Un utilisateur peut modifier ce JSON pour se declarer vainqueur.
- **Impact**: Contournement de toute la progression du jeu.
- **Recommandation**: Acceptable pour un jeu local/cadeau. Pour un contexte plus serieux : etat serveur + signatures.

#### V-07: Pas de rate-limiting sur les appels Home Assistant
- **Fichier**: `/src/features/forge-magnet/DarkVadorForge.tsx` (lignes 59-96), `/src/features/forge-vibration/VibrationForge.tsx` (lignes 41-66)
- **Type**: Denial of Service / CWE-770
- **Severite**: MOYENNE
- **OWASP**: A05:2021 - Security Misconfiguration
- **Detail**: Les fonctions `handleCheck()` et `handleClick()` appellent `getEntityState()` / `pollEntityState()` sans rate-limiting. `pollEntityState` execute un appel toutes les 500ms pendant 5-10 secondes. Un utilisateur malveillant pourrait cliquer en boucle pour envoyer des dizaines de requetes vers l'API Home Assistant.
- **Impact**: Surcharge potentielle de l'instance Home Assistant.
- **Recommandation**: Ajouter un debounce/cooldown et limiter le nombre d'appels concurrents.

### FAIBLE

#### V-08: Injection HTML dans les contenus statiques
- **Fichier**: `/src/components/DoubtOverlay.tsx` (nouveau fichier), `/src/components/ForgeSection.tsx` (nouveau fichier)
- **Type**: XSS potentiel / CWE-79
- **Severite**: FAIBLE
- **OWASP**: A03:2021 - Injection
- **Detail**: Les composants utilisent React (JSX) qui echappe par defaut les contenus. Aucun usage de `dangerouslySetInnerHTML` n'a ete detecte dans les changements. Les chaines affichees (`title`, `FORGE_SUCCESS_MESSAGES`) sont des constantes definies en dur. Risque quasi-nul dans l'etat actuel.
- **Impact**: Aucun dans la configuration actuelle.
- **Recommandation**: Maintenir cette bonne pratique. Ne jamais introduire `dangerouslySetInnerHTML` avec des donnees dynamiques.

#### V-09: Console.log avec information de debug
- **Fichier**: `/src/ha.ts` (ligne 59 - non modifie mais utilise)
- **Type**: Information Disclosure / CWE-532
- **Severite**: FAIBLE
- **OWASP**: A09:2021 - Security Logging and Monitoring Failures
- **Detail**: `console.log(r.ok ? "HA event: ${event}" : "HA error: ${r.status}")` expose les noms d'evenements HA et les codes d'erreur dans la console navigateur.
- **Impact**: Aide au reverse-engineering de l'infrastructure HA.
- **Recommandation**: Supprimer les logs en production ou les conditionner a un mode debug.

---

## Analyse OWASP Top 10 (2021)

| # | Categorie | Risque | Vulnerabilites |
|---|-----------|--------|----------------|
| A01 | Broken Access Control | HAUT | V-03, V-04, V-05, V-06 |
| A02 | Cryptographic Failures | N/A | Aucun chiffrement utilise |
| A03 | Injection | FAIBLE | V-08 (mitige par React) |
| A04 | Insecure Design | MOYEN | V-02, V-06 (architecture client-only) |
| A05 | Security Misconfiguration | MOYEN | V-07 |
| A06 | Vulnerable Components | NON EVALUE | Necessiterait `npm audit` |
| A07 | Identification & Auth Failures | CRITIQUE | V-01 |
| A08 | Software & Data Integrity | FAIBLE | Pas de verification d'integrite du state |
| A09 | Logging & Monitoring Failures | FAIBLE | V-09 |
| A10 | SSRF | N/A | Pas de requetes cote serveur |

---

## Exposition de donnees sensibles

| Donnee | Localisation | Risque |
|--------|-------------|--------|
| Token HA JWT (63 ans de validite) | Bundle JS client via `VITE_HA_TOKEN` | CRITIQUE - extractible par tout visiteur |
| URL Home Assistant | Bundle JS client via `VITE_HA_URL` | HAUTE - revele l'infrastructure |
| Reponses aux enigmes | `config.ts`, `LetterScramble.tsx` | HAUTE - ruine le gameplay |
| Lettres d'amour (contenu personnel) | `config.ts` | FAIBLE - contenu intentionnellement visible une fois l'enigme resolue |
| Entity IDs Home Assistant | `DarkVadorForge.tsx`, `VibrationForge.tsx` | FAIBLE - revele la topologie HA |

---

## Analyse specifique des changements du diff

### Changements positifs pour la securite
1. **Suppression du code duplique** : La consolidation de `useCountdown` en un hook partage reduit la surface de maintenance et les risques de divergence.
2. **Typage strict avec `ForgeProps`** : Le nouveau type (`/src/types/forge.ts`) force un contrat clair entre les forges et leur conteneur, empechant des callbacks incorrects.
3. **Registre de forges explicite** : `/src/config/forges.ts` centralise la declaration des forges, rendant plus visible tout ajout futur.

### Points neutres
1. **Renaming `grimoire_v3` -> `grimoire_v4`** : Le changement de cle localStorage force un reset du state persiste pour les utilisateurs existants. Ce n'est pas un probleme de securite mais cela merite d'etre documente.
2. **Extraction de `DoubtOverlay`** : Composant purement UI, aucun impact securite.
3. **Deplacement des fichiers** (`DarkVadorButton.tsx` -> `DarkVadorForge.tsx`, etc.) : Reorganisation structurelle sans impact securite.

### Points d'attention
1. **`AdminControls` generalise via `FORGES.forEach`** (ligne 63-68 de `EnigmaGrid.tsx`) : Le "solve all" itere sur toutes les forges declarees dans le registre. Si un attaquant peut manipuler `FORGES`, il pourrait injecter des forges arbitraires. Risque negligeable car `FORGES` est un import statique, mais a surveiller si le registre devient dynamique.
2. **`solveForge(key: string)`** (ligne 151 de `store.ts`) : Accepte une cle arbitraire sans validation. Un appel `useStore.getState().solveForge("n'importe_quoi")` ne cause pas d'erreur mais pollue le state. Impact negligeable dans le contexte actuel.

---

## Recommandations concretes par priorite

### P0 - Critique (a faire immediatement)
1. **Proxy backend pour Home Assistant** : Ne plus exposer le token HA cote client. Un endpoint serverless (`/api/ha/state/:entity`) avec le token en variable d'environnement serveur suffit.
2. **Rotation du token HA** : Le token actuel (visible dans `.env`) a une duree de vie de 63 ans. Le regenerer avec une duree raisonnable (1 an max) apres mise en place du proxy.

### P1 - Haute (a faire avant mise en production)
3. **Hasher les reponses aux enigmes** : Remplacer `answer: "mirabel"` par `answerHash: "sha256(...)"` et comparer les hash dans `normalize()`.
4. **Securiser le mode admin** : Ajouter au minimum un secret dans l'URL (`?admin=<sha256_secret>`) plutot qu'un simple boolean.
5. **Rendre les IDs d'enigmes non previsibles** : Utiliser des UUID v4 au lieu de `5`, `Y`, `2g`, `F`, `X`, `2d`.

### P2 - Moyenne (ameliorations)
6. **Conditionner le bouton reset a `isAdmin`** dans `App.tsx`.
7. **Rate-limiter les appels HA** : Debounce de 5s entre deux tentatives de `handleCheck()`.
8. **Supprimer les `console.log`** en production.

### P3 - Faible (bonnes pratiques)
9. **Valider les cles de forge** : Ajouter une assertion dans `solveForge(key)` pour verifier que `key` est une cle connue du registre `FORGES`.
10. **Content Security Policy** : Ajouter des headers CSP pour limiter les scripts autorises.

---

## Note sur le contexte

Ce projet est un **jeu-cadeau personnel** (gift grimoire pour "Leamour"). Le profil de menace est tres different d'une application SaaS. Les vulnerabilites V-02 (reponses en clair) et V-03 (admin sans auth) sont des choix pragmatiques acceptables dans ce contexte. En revanche, **V-01 (token HA expose)** reste critique quel que soit le contexte car il donne acces a l'infrastructure domotique personnelle.
