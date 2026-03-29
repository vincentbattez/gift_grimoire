import { useTranslation } from "react-i18next";

export function LanguageSwitcher(): React.JSX.Element {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  function toggle(): void {
    void i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");
  }

  return (
    <button
      onClick={toggle}
      aria-label={currentLang === "fr" ? "Switch to English" : "Passer en français"}
      className="text-muted/60 hover:text-muted fixed top-3 right-3 z-[250] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-[#3a2a5a40] bg-[#130f2680] text-[0.6rem] font-semibold tracking-wide uppercase backdrop-blur-sm transition-all duration-200 hover:border-[#3a2a5a80]"
    >
      {currentLang === "fr" ? "EN" : "FR"}
    </button>
  );
}
