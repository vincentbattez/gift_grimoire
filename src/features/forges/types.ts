import type { ComponentType } from "react";

export type ForgeProps = {
  /** L'épreuve est-elle déjà résolue (state persisté) */
  solved: boolean;
  /** Appelé par le composant quand l'utilisateur complète l'épreuve */
  onSolve: () => void;
};

export type ForgeAdminAction = {
  label: string;
  onClick: () => void;
  /** Couleur tailwind du bouton (ex: "sky-400") */
  color?: string;
};

export type ForgeModule = {
  key: string;
  title: string;
  successMessage: string;
  /** Texte narratif affiché dans une modal au moment du déblocage */
  introText?: string;
  component: ComponentType<ForgeProps>;
  /** Actions admin supplémentaires spécifiques à la forge */
  adminActionList?: ForgeAdminAction[];

  /** Hook pour lire l'état solved de cette forge */
  useSolved: () => boolean;
  /** Hook pour lire l'état revealed de cette forge */
  useRevealed: () => boolean;
  /** Marquer la forge comme résolue */
  solve: () => void;
  /** Révéler la forge */
  reveal: () => void;
  /** Reset complet de la forge (admin) */
  reset: () => void;
};
