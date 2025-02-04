'use client'
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <footer className={`p-12 shadow-2xl py-6 bg-white ${isArabic ? "text-right" : "text-left"}`}>
      <div className="container flex flex-wrap gap-6 justify-between sm:px-12">
        <div>
          <Image src="/logo.svg" alt="logo" width={50} height={50} />
          <p className="my-6">{t("footerTagline")}</p>
          <div className="flex gap-2">
            {socialLinks.map((social) => (
              <Link
                href={social.link}
                key={social.id}
                className="bg-blueColor/50 hover:bg-blueColor duration-300 w-6 h-6 rounded-sm flex justify-center items-center"
              >
                <social.icon className="cursor-pointer text-white" />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">{t("usefulLinks")}</p>
            {usefulLinks.map((link) => (
              <Link href={link.link} key={link.id}>
                {t(link.name)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">{t("pages")}</p>
            {pagesLink.map((link) => (
              <Link href={link.link} key={link.id}>
                {t(link.name)}
              </Link>
            ))}
          </div>
        </div>
        <p className="font-bold text-blueColor w-full text-center">
          {t("copyright")} &copy; {new Date().getFullYear()}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
