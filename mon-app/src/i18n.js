import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';

export const SUPPORTED_LANGS = ['fr', 'en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGS,
    // Normalise les locales régionales (fr-FR, en-US) vers la langue de base :
    // i18n.language vaudra toujours 'fr' ou 'en', ce que l'API citation attend.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      // Priorité au choix explicite de l'utilisateur, puis au navigateur.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
