import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import commonEN from "./locales/en/common.json";
import enigmaEN from "./locales/en/enigma.json";
import finaleEN from "./locales/en/finale.json";
import forgeEN from "./locales/en/forge.json";
import commonFR from "./locales/fr/common.json";
import enigmaFR from "./locales/fr/enigma.json";
import finaleFR from "./locales/fr/finale.json";
import forgeFR from "./locales/fr/forge.json";

const STORAGE_KEY = "gift-grimoire-lang";

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "fr";
  } catch {
    return "fr";
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    fr: { common: commonFR, enigma: enigmaFR, forge: forgeFR, finale: finaleFR },
    en: { common: commonEN, enigma: enigmaEN, forge: forgeEN, finale: finaleEN },
  },
  lng: getSavedLanguage(),
  fallbackLng: "fr",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

/** Persist language choice */
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* storage full or blocked */
  }
  document.documentElement.lang = lng;
});

// Set initial lang attribute
document.documentElement.lang = i18n.language;
