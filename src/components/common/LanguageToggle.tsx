import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageToggle = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", newLanguage);
  };

  const isAR = i18n.language === "ar";

  return (
    <button
      onClick={toggleLanguage}
      title={t("header.toggleLanguage")}
      aria-label={t("header.toggleLanguage")}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500/30 
        bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isAR ? "flex-row-reverse" : ""
        }`}
    >
      <Globe
        size={18}
        className={`text-gray-600 dark:text-gray-300 ${
          isAR ? "order-2" : "order-1"
        }`}
      />
      <span className={`text-sm font-medium text-gray-700 dark:text-white/90`}>
        {isAR ? "English" : "العربية"}
      </span>
    </button>
  );
};
