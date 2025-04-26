"use client";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Search,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.svg";
import Link from "next/link";
import LanguageOptions from "@/components/languageOptions/LanguageOptions";
import useBoundStore from "@/store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const socialLinks = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/",
    icon: Linkedin,
    id: "linkedinId",
  },
  {
    name: "Twitter",
    link: "https://twitter.com/",
    icon: Twitter,
    id: "twitterId",
  },
  {
    name: "Facebook",
    link: "https://www.facebook.com/",
    icon: Facebook,
    id: "facebookId",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/",
    icon: Instagram,
    id: "instagramId",
  },
];

const Header = () => {
  const { t } = useTranslation();
  const { user } = useBoundStore((state) => state);
  const searchParams = useSearchParams();
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

  if (user?.role == "admin") {
    return null;
  }

  return (
    <header className="flex flex-col">
      <div className="header-top bg-blueColor py-2 text-white">
        <div className="container flex flex-col items-center justify-between text-center sm:text-left lg:flex-row">
          <p className="text-sm">{t("welcome")}</p>
          <div className="flex flex-col-reverse items-center gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <p>{t("follow_us")}</p>
              <div className="flex gap-2">
                {socialLinks.map((socialLink) => (
                  <a
                    key={socialLink.id}
                    href={socialLink.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 p-1 transition-colors hover:bg-white/30"
                  >
                    <socialLink.icon
                      size={14}
                      className="text-white"
                      strokeWidth={2.5}
                    />
                  </a>
                ))}
              </div>
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

      {/* Rest of your header remains unchanged */}
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
                placeholder={t("search_placeholder")}
              />
              <Search className="mr-6" />
            </div>
          </div>

          <>
            {user === null ? (
              <div className="mx-auto flex items-center gap-2">
                <Link href={"/auth/login"} className="border px-6 py-2">
                  {t("login")}
                </Link>
                <Link
                  href={"/auth/register"}
                  className="bg-blueColor px-6 py-2 text-white"
                >
                  {t("sign_up")}
                </Link>
              </div>
            ) : (
              <div className="flex w-[20%] items-center gap-4">
                <Link href={"/properties/add"}>
                  <PlusCircle className="size-7 cursor-pointer" />
                </Link>
                <Link
                  href={
                    user?.role == "admin"
                      ? "/admin/analytics"
                      : "/account/inbox"
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
        </div>
      </div>
    </header>
  );
};

export default Header;
