"use client";
import useBoundStore from "@/store/store";
import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { LANGUAGES_OPTIONS } from "@/utils/data";

const LanguageOptions = () => {
  const { language, changeLanguage } = useBoundStore((state) => state);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={buttonRef}
      className="relative flex cursor-pointer items-center gap-1 z-[10]"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <p>{language}</p>
      <FaChevronDown className="text-sm" />
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="menu absolute -left-12 top-8 rounded-md bg-white p-2 text-black shadow-md"
        >
          {LANGUAGES_OPTIONS.map((option) => (
            <p
              key={option}
              className="cursor-pointer px-6 py-2 duration-300 hover:bg-blueColor hover:text-white"
              style={
                option === language
                  ? { background: "#1563DF", color: "white" }
                  : {}
              }
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                changeLanguage(option);
                setIsMenuOpen(false);
              }}
            >
              {option}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageOptions;
