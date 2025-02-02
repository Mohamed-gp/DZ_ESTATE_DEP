"use client";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const Featured = () => {
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const getPropertiesCategories = async () => {
    try {
      const { data } = await customAxios.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const searchHandler = (category: string) => {
    try {
      router.push(`/properties?category=${category}`);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getPropertiesCategories();
  }, []);
  return (
    <section className="my-12 bg-[#AED1FF] py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Featured Categories
        </h2>
        <div className="flex items-center justify-center gap-4">
          {categories.map((category: any, ind) => (
            <div
              key={category?.name + ind}
              onClick={() => searchHandler(category?.name)}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-lg bg-white py-6 shadow-md"
            >
              {/* {React.cloneElement(category.iconSVG, {
                fill: "#1563DF",
              })} */}
              <span className="font-bold text-gray-700">{category?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
