import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial language and direction
    const savedLanguage =
      localStorage.getItem("language") || i18n.language || "en";
    document.documentElement.lang = savedLanguage;
    const dir = savedLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    // Add a class on body so CSS / components can target RTL easily
    if (dir === "rtl") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [i18n.language]);

  return { language: i18n.language, isRTL: i18n.language === "ar" };
};
