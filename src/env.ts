import { z } from "zod";

const envSchema = z.object({
  HA_URL: z.url("HA_URL doit être une URL valide (ex: https://homeassistant.local:8123)"),
  HA_TOKEN: z.string().min(1, "HA_TOKEN est requis"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse({
    HA_URL: import.meta.env.VITE_HA_URL as unknown,
    HA_TOKEN: import.meta.env.VITE_HA_TOKEN as unknown,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- Error object is thrown
    throw new Error(
      `\n❌ Variables d'environnement invalides:\n${errors}\n\nVérifie ton fichier .env à la racine du projet.\n`,
    );
  }

  return result.data;
}

export const env = validateEnv();
