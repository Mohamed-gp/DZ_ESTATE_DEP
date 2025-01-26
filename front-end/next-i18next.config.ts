const nextI18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ar'],
  },
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
};

export default nextI18nConfig;