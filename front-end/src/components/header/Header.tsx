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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  const pathname = usePathname();
  const router = useRouter();

  // Local search input value - separate from URL param
  const [searchInputValue, setSearchInputValue] = useState("");

  // Actual search term from URL - this drives the real search
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSearchRef = useRef<string>("");
  const isPropertiesPage = useMemo(
    () => pathname.includes("/properties"),
    [pathname],
  );

  // This effect synchronizes the search parameter from URL with our input value
  useEffect(() => {
    const keyword = searchParams.get("keyword") || "";
    setSearchInputValue(keyword);

    // Only update when coming from external navigation
    if (previousSearchRef.current !== keyword) {
      setSearchTerm(keyword);
      previousSearchRef.current = keyword;
    }
  }, [searchParams]);

  // Optimized debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      // Update the input immediately for responsive UI
      setSearchInputValue(value);

      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set a new timeout to update the URL after user stops typing
      searchTimeoutRef.current = setTimeout(() => {
        // Avoid unnecessary navigation if value hasn't changed
        if (value === previousSearchRef.current) return;

        previousSearchRef.current = value;
        setSearchTerm(value);

        // Only navigate if we're not already on the properties page
        // or if we are and the value changed
        if (value) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("keyword", value);

          if (isPropertiesPage) {
            // Use replace instead of push to avoid browser history buildup
            router.replace(`/properties?${params.toString()}`, {
              scroll: false,
            });
          } else {
            router.push(`/properties?${params.toString()}`);
          }
        } else if (isPropertiesPage) {
          // Only remove keyword parameter without full navigation
          const params = new URLSearchParams(searchParams.toString());
          params.delete("keyword");
          router.replace(`/properties?${params.toString()}`, { scroll: false });
        }
      }, 500); // Increased to 500ms for better performance
    },
    [searchParams, router, isPropertiesPage],
  );

  // Optimized immediate search handler for Enter key
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Clear any pending debounced search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      // Execute search immediately
      const value = searchInputValue;
      previousSearchRef.current = value;
      setSearchTerm(value);

      const params = new URLSearchParams();
      if (value) {
        params.set("keyword", value);
      }

      router.push(`/properties?${params.toString()}`);
    },
    [router, searchInputValue],
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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

      <div className="header-bottom bg-white py-6">
        <div className="container flex flex-wrap items-center justify-between gap-y-6">
          <Link href={"/"} className="logo mx-auto flex items-center">
            <p className="font-bold text-blackColor">Estatery</p>
            <Image src={logo} alt="logo" priority />
          </Link>
          <div className="mx-auto flex items-center">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative flex w-full items-center border bg-white py-2">
                <input
                  type="text"
                  value={searchInputValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-full w-full flex-1 px-4 pl-10 focus:outline-none"
                  placeholder={t("search_placeholder")}
                  aria-label="Search properties"
                />
                <div className="absolute left-3 flex items-center justify-center text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
                <button type="submit" className="sr-only">
                  Search
                </button>
              </div>
            </form>
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
                    src={user?.profile_image || "/default-profile.png"}
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
