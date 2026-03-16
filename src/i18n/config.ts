import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const lng = localStorage.getItem('language') || 'en';

// Each locale is a separate webpack chunk — only the active language loads on startup
const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import(/* webpackChunkName: "locale-en" */ '../locales/en.json'),
  uk: () => import(/* webpackChunkName: "locale-uk" */ '../locales/uk.json'),
  id: () => import(/* webpackChunkName: "locale-id" */ '../locales/id.json'),
};

i18n.use(initReactI18next).init({
  resources: {},
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Load active locale + English fallback (if different), then resolve
export const i18nReady: Promise<void> = (async () => {
  const loadActive = (localeLoaders[lng] ?? localeLoaders.en)();
  const loadFallback = lng !== 'en' ? localeLoaders.en() : Promise.resolve(null);
  const [active, fallback] = await Promise.all([loadActive, loadFallback]);
  i18n.addResourceBundle(lng, 'translation', active.default, true, true);
  if (fallback) {
    i18n.addResourceBundle('en', 'translation', fallback.default, true, true);
  }
})();

export default i18n;
