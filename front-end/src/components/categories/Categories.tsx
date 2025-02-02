"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import customAxios from "@/utils/customAxios";
import clsx from "clsx";

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const getPropertiesCategories = async () => {
    try {
      const { data } = await customAxios.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPropertiesCategories();
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const selectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const params = new URLSearchParams(window.location.search);
    if (categoryName) {
      params.set("category", categoryName);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="categories flex flex-1 items-end justify-evenly overflow-x-auto">
      {categories.map((category: any, index) => (
        <div
          key={index}
          className="flex cursor-pointer flex-col items-center justify-center gap-2"
          onClick={() => selectCategory(category?.name)}
        >
          {/* {React.cloneElement(category.iconSVG, {
            fill: selectedCategory === category.name ? "#1563DF" : "#565656",
          })} */}
          <p
            className={clsx(
              selectedCategory == category?.name
                ? "font-bold text-blueColor"
                : "text-[#565656]",
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
