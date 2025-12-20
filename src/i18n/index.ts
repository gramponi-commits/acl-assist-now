import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import el from './locales/el.json';

const SUPPORTED_LANGUAGES = ['en', 'it', 'es', 'fr', 'de', 'el'];

const getDefaultLanguage = (): string => {
  // Check if user has a saved preference
  const savedLanguage = localStorage.getItem('acls-language');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Detect browser language
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      el: { translation: el },
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
