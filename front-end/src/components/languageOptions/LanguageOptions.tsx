'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosArrowDown } from 'react-icons/io';


export  default function LanguageOptions() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.en') },
    { code: 'ar', name: t('language.ar') },
    { code: 'fr', name: t('language.fr') }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  useEffect(() => {
    setIsRendered(true);
  }, []);
  if (isRendered === false) {
    return null;
  }
  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex cursor-pointer items-center gap-2"
      >
        {currentLanguage?.name}
        <IoIosArrowDown />
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-32 rounded-md bg-white shadow-lg">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                cursor-pointer px-4 py-2 
                ${i18n.language === lang.code ? 'bg-blueColor text-white' : 'hover:bg-gray-100'}
              `}
            >
              {lang.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}