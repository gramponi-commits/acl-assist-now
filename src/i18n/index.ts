import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import da from './locales/da.json';
import de from './locales/de.json';
import el from './locales/el.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fa from './locales/fa.json';
import fr from './locales/fr.json';
import he from './locales/he.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import no from './locales/no.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import sv from './locales/sv.json';
import th from './locales/th.json';
import tl from './locales/tl.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import vi from './locales/vi.json';
import zhCN from './locales/zh-CN.json';

const SUPPORTED_LANGUAGES = [
  'en', 'it', 'es', 'fr', 'de', 'el',  // existing
  'zh-CN', 'hi', 'ar', 'bn', 'pt', 'ru', 'id', 'uk',
  'nl', 'da', 'sv', 'no', 'pl', 'ja', 'ko',
  'tr', 'vi', 'th', 'tl', 'fa', 'he'  // additional
];

// RTL (Right-to-Left) languages
const RTL_LANGUAGES = ['ar', 'fa', 'he'];

export const isRTL = (lang: string): boolean => RTL_LANGUAGES.includes(lang);

const getDefaultLanguage = (): string => {
  // Check if user has a saved preference
  const savedLanguage = localStorage.getItem('acls-language');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  // Detect browser language - try full locale first (e.g., zh-CN), then base language
  const browserLocale = navigator.language || 'en';
  if (SUPPORTED_LANGUAGES.includes(browserLocale)) {
    return browserLocale;
  }
  const baseLang = browserLocale.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(baseLang) ? baseLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      bn: { translation: bn },
      da: { translation: da },
      de: { translation: de },
      el: { translation: el },
      en: { translation: en },
      es: { translation: es },
      fa: { translation: fa },
      fr: { translation: fr },
      he: { translation: he },
      hi: { translation: hi },
      id: { translation: id },
      it: { translation: it },
      ja: { translation: ja },
      ko: { translation: ko },
      nl: { translation: nl },
      no: { translation: no },
      pl: { translation: pl },
      pt: { translation: pt },
      ru: { translation: ru },
      sv: { translation: sv },
      th: { translation: th },
      tl: { translation: tl },
      tr: { translation: tr },
      uk: { translation: uk },
      vi: { translation: vi },
      'zh-CN': { translation: zhCN },
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
