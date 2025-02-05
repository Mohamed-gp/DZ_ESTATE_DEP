// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Estatery online states store.",
      "follow_us": "Follow us:",
      "search_placeholder": "Search for anything...",
      "login": "Login",
      "sign_up": "Sign up",
      "find_home": "Find Your Perfect Home",
      "platform_description": "A great platform to buy, sell, or even rent your properties without any commissions.",
      "all": "All",
      "sale": "Sale",
      "rent": "Rent",
      "type": "Type",
      "category": "Category",
      "keyword": "Keyword",
      "search": "Search",
      "select_category": "Select Category",
      "enter_keyword": "Enter keyword"
    }
  },
  ar: {
    translation: {
      "welcome": "مرحباً بكم في متجر العقارات الإلكتروني",
      "follow_us": "تابعنا:",
      "search_placeholder": "ابحث عن أي شيء...",
      "login": "تسجيل الدخول",
      "sign_up": "إنشاء حساب",
      "find_home": "اعثر على منزلك المثالي",
      "platform_description": "منصة رائعة لشراء أو بيع أو حتى تأجير عقاراتك بدون أي عمولات.",
      "all": "الكل",
      "sale": "للبيع",
      "rent": "للإيجار",
      "type": "النوع",
      "category": "الفئة",
      "keyword": "الكلمة المفتاحية",
      "search": "بحث",
      "select_category": "اختر الفئة",
      "enter_keyword": "أدخل الكلمة المفتاحية"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue sur la boutique en ligne Estatery.",
      "follow_us": "Suivez-nous:",
      "search_placeholder": "Rechercher...",
      "login": "Connexion",
      "sign_up": "S'inscrire",
      "find_home": "Trouvez Votre Maison Idéale",
      "platform_description": "Une excellente plateforme pour acheter, vendre ou même louer vos propriétés sans commissions.",
      "all": "Tout",
      "sale": "Vente",
      "rent": "Location",
      "type": "Type",
      "category": "Catégorie",
      "keyword": "Mot-clé",
      "search": "Rechercher",
      "select_category": "Sélectionner une catégorie",
      "enter_keyword": "Entrez un mot-clé"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;