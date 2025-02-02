"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import customAxios from "@/utils/customAxios";

const Hero = () => {
  const [propertySaleType, setPropertySaleType] = useState("all");
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    try {
      const { data } = await customAxios.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/heroImage.jpg)",
        minHeight: "calc(100vh - 90px - 40px)",
      }}
    >
      <div className="absolute left-0 top-0 h-full w-full bg-black opacity-20"></div>
      <div className="relative w-full max-w-3xl px-4">
        <div className="w-full rounded-lg  bg-opacity-75 p-8">
          <h1 className="mb-4 text-center text-4xl font-bold text-white">
            Find Your Perfect Home
          </h1>
          <p className="mb-8 text-center text-lg text-white">
            A great platform to buy, sell, or even rent your properties without
            any commissions.
          </p>
          <div className="mb-4 flex justify-center space-x-2">
            <button
              onClick={() => setPropertySaleType("all")}
              className={clsx(
                propertySaleType === "all"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "rounded-md px-4 py-2 font-bold"
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
                "rounded-md px-4 py-2 font-bold"
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
                "rounded-md px-4 py-2 font-bold"
              )}
            >
              Rent
            </button>
          </div>
          <div className="mb-4 flex flex-col space-y-4 rounded-md bg-white p-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex flex-1 flex-col">
              <label className="mb-1 text-sm font-semibold">Type</label>
              <select className="rounded-md border-gray-300 bg-gray-100 px-4 py-2">
                <option>All Type</option>
                <option>Rent</option>
                <option>Sell</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col">
              <label className="mb-1 text-sm font-semibold">Category</label>
              <select className="rounded-md border-gray-300 bg-gray-100 px-4 py-2">
                <option disabled>Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col">
              <label className="mb-1 text-sm font-semibold">Keyword</label>
              <input
                type="text"
                placeholder="Enter keyword"
                className="rounded-md border-gray-300 bg-gray-100 px-4 py-2"
              />
            </div>
          </div>
          <div className="flex  flex-col justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            {/* <button className="rounded-md border bg-white px-4 py-2 font-bold duration-300 hover:bg-blueColor hover:text-white">
              Filter
            </button> */}
            <button className="rounded-md bg-blueColor px-4 py-2 font-bold text-white hover:bg-blueColor">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;