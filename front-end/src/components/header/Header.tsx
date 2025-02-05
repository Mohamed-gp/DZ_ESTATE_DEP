"use client";
import { FaInstagram, FaMagnifyingGlass } from "react-icons/fa6";
import Image from "next/image";
import logo from "../../../public/logo.svg";
import Link from "next/link";
import { FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
import { IoMdAddCircleOutline, IoMdOptions } from "react-icons/io";

import LanguageOptions from "@/components/languageOptions/LanguageOptions"; 
import useBoundStore from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
const socialLinks = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/",
    icon: FaLinkedinIn,
    id: "linkedinId",
  },
  {
    name: "Twitter",
    link: "https://twitter.com/",
    icon: FaXTwitter,
    id: "twitterId",
  },
  {
    name: "Facebook",
    link: "https://www.facebook.com/",
    icon: FaFacebookF,
    id: "facebookId",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/",
    icon: FaInstagram,
    id: "instagramId",
  },
];

const Header = () => {
  
  const {  t } = useTranslation();
  const { user } = useBoundStore((state) => state);
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const searchHandler = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }
    router.push(`/properties?${params.toString()}`);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="flex flex-col">
      <div className="header-top bg-blueColor py-2 text-white">
        <div className="container flex flex-col items-center justify-between text-center sm:text-left lg:flex-row">
          <p className="text-sm">{t('welcome')}</p>
          <div className="flex flex-col-reverse items-center gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <p>{t('follow_us')}</p>
              {socialLinks.map((socialLink) => (
                <a
                  key={socialLink.id}
                  href={socialLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <socialLink.icon className="text-white" />
                </a>
              ))}
            </div>
            <span className="hidden h-6 w-[1px] bg-white opacity-50 sm:inline-block"></span>
            <div className="menus flex gap-6">
              <div className="language-menu">
                <LanguageOptions />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="header-bottom bg-white py-6">
        <div className="container flex flex-wrap items-center justify-between gap-y-6">
          <Link href={"/"} className="logo mx-auto flex items-center">
            <p className="font-bold text-blackColor">Estatery</p>
            <Image src={logo} alt="logo" />
          </Link>
          <div className="mx-auto flex items-center">
            <div className="flex w-full items-center border bg-white py-2">
              <input
                type="text"
                value={searchParams.get("keyword") || ""}
                onChange={(e) => searchHandler(e.target.value)}
                className="h-full w-[50%] flex-1 px-4 focus:outline-none"
                placeholder={t('search_placeholder')}
              />
              <FaMagnifyingGlass className="mr-6" />
            </div>
            <IoMdOptions className="h-[40px] w-[40px] cursor-pointer rounded-sm bg-blueColor p-2 text-xl text-white" />
          </div>
          {isMounted && (
            <>
              {user === null ? (
                <div className="mx-auto flex items-center gap-2">
                  <Link href={"/auth/login"} className="border px-6 py-2">
                    {t('login')}
                  </Link>
                  <Link
                    href={"/auth/register"}
                    className="bg-blueColor px-6 py-2 text-white"
                  >
                    {t('sign_up')}
                  </Link>
                </div>
              ) : (
                <div className="flex w-[20%] items-center gap-4">
                  <Link href={"/properties/add"}>
                    <IoMdAddCircleOutline className="size-7 cursor-pointer" />
                  </Link>
                  <Link
                    href={
                      user?.role == "admin"
                        ? "/admin/analytics"
                        : "/account/notifications"
                    }
                    className="relative h-10 w-10 overflow-hidden rounded-full"
                  >
                    <Image
                      src={user?.profile_image}
                      alt="Profile picture"
                      className="rounded-full object-cover"
                      width={60}
                      height={60}
                      unoptimized
                    />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;