import { z } from "zod";

const envSchema = z.object({
  HA_URL: z.string().url("HA_URL doit être une URL valide (ex: https://homeassistant.local:8123)"),
  HA_TOKEN: z.string().min(1, "HA_TOKEN est requis"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse({
    HA_URL: import.meta.env.VITE_HA_URL,
    HA_TOKEN: import.meta.env.VITE_HA_TOKEN,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n❌ Variables d'environnement invalides:\n${errors}\n\nVérifie ton fichier .env à la racine du projet.\n`,
    );
  }

  return result.data;
}

export const env = validateEnv();
