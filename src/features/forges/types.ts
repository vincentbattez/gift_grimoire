import type { ComponentType } from "react";

export interface ForgeProps {
  /** L'épreuve est-elle déjà résolue (state persisté) */
  solved: boolean;
  /** Appelé par le composant quand l'utilisateur complète l'épreuve */
  onSolve: () => void;
}

export interface ForgeAdminAction {
  label: string;
  onClick: () => void;
  /** Couleur tailwind du bouton (ex: "sky-400") */
  color?: string;
}

export interface ForgeModule {
  key: string;
  title: string;
  successMessage: string;
  /** Texte narratif affiché dans une modal au moment du déblocage */
  introText?: string;
  component: ComponentType<ForgeProps>;
  /** Appelé lors du reset admin pour réinitialiser le store propre au module */
  onReset?: () => void;
  /** Actions admin supplémentaires spécifiques à la forge */
  adminActions?: ForgeAdminAction[];
}
