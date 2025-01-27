"use client";
import useBoundStore from "@/store/store";
import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { CURRENCY_LIST } from "@/utils/data";

const LanguageOptions = () => {
  const { currency, changeCurrency } = useBoundStore((state) => state);
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
      className="relative z-[10] flex cursor-pointer items-center gap-1"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <p>{currency}</p>
      <FaChevronDown className="text-sm" />
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="menu absolute left-0 top-8 rounded-md bg-white p-2 text-black shadow-md"
        >
          {CURRENCY_LIST.map((option) => (
            <p
              key={option}
              className="cursor-pointer px-6 py-2 duration-300 hover:bg-blueColor hover:text-white"
              style={
                option === currency
                  ? { background: "#1563DF", color: "white" }
                  : {}
              }
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                changeCurrency(option);
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
