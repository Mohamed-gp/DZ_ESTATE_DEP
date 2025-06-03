"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

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

const usefulLinks = [
  {
    name: "heroLink",
    link: "#hero",
    id: "heroLinkId",
  },
  {
    name: "aboutUsLink",
    link: "#aboutUs",
    id: "aboutUsLinkId",
  },
  {
    name: "featuresLink",
    link: "#features",
    id: "featuresLinkId",
  },
  {
    name: "contactUsLink",
    link: "#contactUs",
    id: "contactUsLinkId",
  },
];

const pagesLink = [
  {
    name: "homeLink",
    link: "/",
    id: "homeLinkId",
  },
  {
    name: "propertiesLink",
    link: "/properties",
    id: "propertiesLinkId",
  },
];

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={`bg-white p-12 py-6 shadow-2xl`}>
      <div className="container flex flex-wrap justify-between gap-6 sm:px-12">
        <div>
          <Image src="/logo.svg" alt="logo" width={50} height={50} />
          <p className="my-6">{t("footerTagline")}</p>
          <div className="flex gap-2.5">
            {socialLinks.map((social) => (
              <Link
                href={social.link}
                key={social.id}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-blueColor/90 text-white shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:bg-blueColor hover:shadow"
                aria-label={social.name}
              >
                <social.icon
                  size={14}
                  strokeWidth={2.5}
                  className="text-white"
                />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">{t("usefulLinks")}</p>
            {usefulLinks.map((link) => (
              <Link
                href={link.link}
                key={link.id}
                className="text-gray-600 hover:text-blueColor"
              >
                {t(link.name)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">{t("pages")}</p>
            {pagesLink.map((link) => (
              <Link
                href={link.link}
                key={link.id}
                className="text-gray-600 hover:text-blueColor"
              >
                {t(link.name)}
              </Link>
            ))}
          </div>
        </div>
        <p className="w-full text-center font-bold text-blueColor">
          {t("copyright")} &copy; {new Date().getFullYear()}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
