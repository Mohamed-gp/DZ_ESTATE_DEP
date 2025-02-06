"use client";
import { useState, useEffect, useRef } from "react";
import { MdDashboard } from "react-icons/md";
import {
  FaBell,
  FaGear,
  FaInbox,
  FaFile,
  FaHeart,
  FaUsers,
  FaChartBar,
  FaTags,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { FaEdit, FaListAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";

const AdminSideBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sidebarRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
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

  const menuItems = [
    { name: "Analytics", link: "/admin/analytics", icon: FaChartBar },
    { name: "Users", link: "/admin/users", icon: FaUsers },

    {
      name: "Posts",
      link: "/admin/posts",
      icon: FaFile,
    },
    {
      name: "Categories",
      link: "/admin/categories",
      icon: FaListAlt,
    },
    {
      name: "Features",
      link: "/admin/features",
      icon: FaTags,
    },
    // {
    //   name: "Notifications",
    //   link: "/account/notifications",
    //   icon: FaBell,
    // },
    // {
    //   name: "Inbox",
    //   link: "/account/inbox",
    //   icon: FaInbox,
    // },
    // { name: "Wishlist", link: "/account/wishlist", icon: FaHeart },
    // { name: "Posts", link: "/account/posts", icon: FaFile },

    // {
    //   name: "Edit Properties",
    //   link: "/admin/edit-properties",
    //   icon: FaEdit,
    // },
    {
      name: "Settings",
      link: "/account/settings",
      icon: FaGear,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

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
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    const index = menuItems.findIndex((item) => item.link === pathname);
    setActiveIndex(index);
  }, [pathname]);

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
                    <item.icon size={24} /> {/* Render the icon */}
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
              Log Out
            </button>
          </footer>
        </div>
        <button
          ref={buttonRef}
          className="fixed left-full top-1/2 z-50 rounded-full bg-transparent p-2 backdrop-blur-lg focus:outline-none lg:hidden"
        >
          {isOpen ? (
            <FaChevronLeft
              onClick={toggleSidebar}
              className="h-4 w-4 scale-150 transform"
            />
          ) : (
            <FaChevronRight
              onClick={toggleSidebar}
              className="h-4 w-4 scale-150 transform"
            />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </aside>
    </>
  );
};

export default AdminSideBar;
