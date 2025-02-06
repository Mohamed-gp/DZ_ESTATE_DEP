"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import i18nConfig from "../../../i18nConfig";

export default function LanguageOptions() {
  const [isRendered, setIsRendered] = useState(false);
  const { i18n } = useTranslation();

  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const newLocale = e.target.value;

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push("/" + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`),
      );
    }

    router.refresh();
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);
  if (isRendered === false) {
    return null;
  }
  const languages = i18nConfig.locales;
  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2"
      >
        {currentLocale}
        <IoIosArrowDown />
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-32 rounded-md bg-white shadow-lg">
          {languages.map((lang) => (
            <div
              key={lang}
              onClick={() => handleChange({ target: { value: lang } })}
              className={`cursor-pointer px-4 py-2 text-black ${i18n.language === lang ? "bg-blueColor !text-white" : "hover:bg-gray-100"} `}
            >
              {lang}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
