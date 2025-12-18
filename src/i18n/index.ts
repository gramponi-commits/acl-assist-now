import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';

const SUPPORTED_LANGUAGES = ['en', 'it'];

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
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
