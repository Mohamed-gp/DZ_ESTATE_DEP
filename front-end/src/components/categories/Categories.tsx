"use client";
import React, { useState } from "react";
import clsx from "clsx";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState("Modern Villa");
  const [categories, setCategories] = useState([

  ])
  return (
    <div className="overflow-x-auto categories flex items-end  flex-1 justify-evenly">
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex gap-2  flex-col justify-center  items-center cursor-pointer"
          onClick={() => setSelectedCategory(category.name)}
        >
          {/* {React.cloneElement(category.iconSVG, {
            fill: selectedCategory === category.name ? "#1563DF" : "#565656",
          })} */}
          <p
            className={clsx(
              selectedCategory == category.name
                ? "text-blueColor font-bold"
                : "text-[#565656]"
            )}
          >
            {category.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Categories;
