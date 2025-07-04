"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Settings,
  FileText,
  Users,
  BarChart,
  Tags,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import { useTranslation } from "react-i18next";

interface MenuItem {
  name: string;
  link: string;
  icon: LucideIcon;
}

const AdminSideBar = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuItems: MenuItem[] = useMemo(() => {
    return [
      { name: t("admin.analytics"), link: "/admin/analytics", icon: BarChart },
      { name: t("admin.users"), link: "/admin/users", icon: Users },
      {
        name: t("admin.posts"),
        link: "/admin/posts",
        icon: FileText,
      },
      {
        name: t("admin.categories"),
        link: "/admin/categories",
        icon: List,
      },
      {
        name: t("admin.features"),
        link: "/admin/features",
        icon: Tags,
      },
      {
        name: t("sidebar.settings"),
        link: "/account/settings",
        icon: Settings,
      },
    ];
  }, [t]);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const { setUser } = useBoundStore((state) => state);

  const logoutHandler = async () => {
    try {
      const { data } = await customAxios.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("user");
      router.push("/");
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || t("auth.logoutFailed"));
    }
  };

  useEffect(() => {
    const index = menuItems.findIndex((item) => item.link === pathname);
    setActiveIndex(index !== -1 ? index : 0);
  }, [pathname, menuItems]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`inset-y-0 left-0 z-[2231331] w-64 min-w-64 transform bg-white transition-all duration-300 ease-in-out ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } fixed lg:sticky lg:top-0 lg:translate-x-0`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto py-8">
          <nav className="mt-8 flex-grow overflow-y-auto">
            <ul className="relative">
              <div
                className="absolute h-12 w-full bg-[#79D0F1] transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateY(${activeIndex * 3}rem)`,
                }}
              ></div>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    className={`relative z-10 flex items-center gap-2 px-4 py-3 pl-10 ${
                      activeIndex === index
                        ? "font-semibold text-white"
                        : "font-normal hover:bg-[#79D0F1]/20"
                    } focus:outline-none`}
                    onClick={() => {
                      setActiveIndex(index);
                      if (isMobile) {
                        setIsOpen(false);
                      }
                    }}
                  >
                    <item.icon size={24} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <footer className="mt-auto flex flex-shrink-0 flex-col items-center gap-6 lg:gap-12">
            <div className="relative inline-block h-32 w-32">
              <div
                className="absolute h-[5.5rem] w-[5.5rem] rounded-xl bg-[#EFF9FB]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(45deg)",
                }}
              ></div>
            </div>
            <button
              onClick={logoutHandler}
              className="w-3/4 rounded bg-blue-500 py-2 text-base text-white focus:outline-none"
            >
              {t("auth.logout")}
            </button>
          </footer>
        </div>
        <button
          ref={buttonRef}
          className="fixed left-full top-1/2 z-50 rounded-full bg-transparent p-2 backdrop-blur-lg focus:outline-none lg:hidden"
        >
          {isOpen ? (
            <ChevronLeft
              onClick={toggleSidebar}
              className="h-4 w-4 scale-150 transform"
            />
          ) : (
            <ChevronRight
              onClick={toggleSidebar}
              className="h-4 w-4 scale-150 transform"
            />
          )}
          <span className="sr-only">{t("sidebar.toggleSidebar")}</span>
        </button>
      </aside>
    </>
  );
};

export default AdminSideBar;
