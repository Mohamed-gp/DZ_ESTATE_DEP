import NextI18Next from 'next-i18next';
import nextI18nConfig from './next-i18next.config';

const NextI18NextInstance = new NextI18Next(nextI18nConfig);

export const {
  appWithTranslation,
  useTranslation,
  i18n,
} = NextI18NextInstance;