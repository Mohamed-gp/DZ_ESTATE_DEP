"use client";
import customAxios from "@/utils/customAxios";
import React, { useState, useEffect } from "react";

const Featured = () => {
  const [categories, setCategories] = useState([
    { name: "Beach", _id: "1" },
    { name: "Countryside", _id: "2" },
  ]);
  const getPropertiesCategories = async () => {
    try {
      const { data } = await customAxios.get("/properties/categories");
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // getPropertiesCategories();
  }, []);
  return (
    <section className="my-12 bg-[#AED1FF] py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 md:grid-cols-7">
          {categories.map((category, ind) => (
            <div
              key={category.name + ind}
              className="flex h-full flex-col items-center justify-end gap-2 rounded-lg bg-white py-6 shadow-md"
            >
              {/* {React.cloneElement(category.iconSVG, {
                fill: "#1563DF",
              })} */}
              <span className="font-bold text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
