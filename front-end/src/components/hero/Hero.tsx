"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import customAxios from "@/utils/customAxios";
const Hero = () => {
  const [propertySaleType, setPropertySaleType] = useState("all");
  const [categories, setCategories] = useState([]);
  const getCategories = async () => {
    try {
      const { data } = await customAxios.post("/categories");
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  return (
    // linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/heroImage.jpg)",
        minHeight: "calc(100vh - 90px - 40px",
      }}
    >
      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-20"></div>
      <div className="relative">
        <div className="w-full max-w-3xl rounded-lg p-8">
          <h1 className="mb-4 text-center text-4xl font-bold text-white">
            Find Your Perfect Home
          </h1>
          <p className="mb-8 text-center text-lg text-white">
            A great platform to buy, sell, or even rent your properties without
            any commisions.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setPropertySaleType("all")}
              className={clsx(
                propertySaleType === "all"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "px-9 py-4 font-bold",
              )}
            >
              All
            </button>
            <button
              onClick={() => setPropertySaleType("sale")}
              className={clsx(
                propertySaleType === "sale"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "px-9 py-4 font-bold",
              )}
            >
              Sale
            </button>
            <button
              onClick={() => setPropertySaleType("rent")}
              className={clsx(
                propertySaleType === "rent"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "px-9 py-4 font-bold",
              )}
            >
              Rent
            </button>
          </div>
          <div className="mb-4 flex items-center bg-white p-4">
            <div className="div flex flex-col">
              <p>Type</p>
              <select className="mr-2 flex-1 rounded-l-md border-gray-300 bg-gray-100 px-4 py-2">
                <option>All Type</option>
                <option>Rent</option>
                <option>Sell</option>
              </select>
            </div>
            <div className="div flex flex-col">
              <p>Category</p>
              <select className="mr-2 flex-1 rounded-l-md border-gray-300 bg-gray-100 px-4 py-2">
                <option disabled>Select Location</option>
                <option>Select Location</option>
              </select>
            </div>
            <div className="div flex flex-col">
              <p>Keyword</p>
              <select className="mr-2 flex-1 rounded-l-md border-gray-300 bg-gray-100 px-4 py-2">
                <option>Enter keyword</option>
              </select>
            </div>
            <button className="mx-auto block rounded border bg-white px-4 py-2 font-bold duration-300 hover:bg-blueColor hover:text-white">
              Filter
            </button>
            <button className="rounded-r-md bg-blueColor px-4 py-2 font-bold text-white hover:bg-blueColor">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
