export interface ForgeProps {
  /** L'épreuve est-elle déjà résolue (state persisté) */
  solved: boolean;
  /** Appelé par le composant quand l'utilisateur complète l'épreuve */
  onSolve: () => void;
}

export interface ForgeModule {
  key: string;
  title: string;
  component: React.ComponentType<ForgeProps>;
}
