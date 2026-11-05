import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ar from './locales/ar/translation.json'
import fr from './locales/fr/translation.json'
import es from './locales/es/translation.json'
import pt from './locales/pt/translation.json'

const supportedLanguages = ['en', 'ar', 'fr', 'es', 'pt']
const savedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('appLanguage') : null
const initialLanguage = savedLanguage && supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, ar: { translation: ar }, fr: { translation: fr },
    es: { translation: es }, pt: { translation: pt },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
