export type Locale = "pt-BR" | "en" | "es";

const STORAGE_KEY = "smart-host-locale";

export const translations = {
  "pt-BR": {
    resources: "Recursos", pricing: "Preços", about: "Sobre", login: "Entrar", start: "Começar Grátis",
    heroTitle: "Gestão hoteleira inteligente, simples e eficiente", heroDescription: "Centralize reservas, hóspedes, quartos, caixa e operação do seu hotel em uma única plataforma.",
    language: "Idioma", portuguese: "Português", english: "Inglês", spanish: "Espanhol"
  },
  en: {
    resources: "Features", pricing: "Pricing", about: "About", login: "Sign in", start: "Start Free",
    heroTitle: "Smart hotel management, simple and efficient", heroDescription: "Centralize reservations, guests, rooms, cash management and hotel operations in one platform.",
    language: "Language", portuguese: "Portuguese", english: "English", spanish: "Spanish"
  },
  es: {
    resources: "Funciones", pricing: "Precios", about: "Nosotros", login: "Iniciar sesión", start: "Comenzar gratis",
    heroTitle: "Gestión hotelera inteligente, simple y eficiente", heroDescription: "Centraliza reservas, huéspedes, habitaciones, caja y operaciones de tu hotel en una sola plataforma.",
    language: "Idioma", portuguese: "Portugués", english: "Inglés", spanish: "Español"
  }
} as const;

export type TranslationKey = keyof typeof translations["pt-BR"];

export function getInitialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved && saved in translations) return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("en")) return "en";
  if (browser.startsWith("es")) return "es";
  return "pt-BR";
}

export function saveLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}
