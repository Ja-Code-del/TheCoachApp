import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import fr from '../locales/fr';
import en from '../locales/en';

const i18n = new I18n({ fr, en });

// Langue du téléphone (ex: "fr-FR", "en-US", "es-ES")
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';

// Langues supportées — fallback anglais si non supportée
const SUPPORTED = ['fr', 'en'];
i18n.locale = SUPPORTED.includes(deviceLocale) ? deviceLocale : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

// Raccourci utilisé partout dans l'app : t('key')
export const t = (key, options) => i18n.t(key, options);

// Langue active (utile pour formater les dates)
export const currentLocale = i18n.locale;