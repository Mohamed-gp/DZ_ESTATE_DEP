"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";

const Hero = () => {
  const [propertySaleStatus, setPropertySaleStatus] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");

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

  const router = useRouter();
  const searchHandler = () => {
    const query = new URLSearchParams({
      status: propertySaleStatus === "all" ? "" : propertySaleStatus,
      category: selectedCategory,
      keyword,
    }).toString();

    router.push(`/properties?${query}`);
  };

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
        <div className="w-full rounded-lg bg-opacity-75 p-8">
          <h1 className="mb-4 text-center text-4xl font-bold text-white">
            Find Your Perfect Home
          </h1>
          <p className="mb-8 text-center text-lg text-white">
            A great platform to buy, sell, or even rent your properties without
            any commissions.
          </p>
          <div className="mb-4 flex justify-center space-x-2">
            <button
              onClick={() => setPropertySaleStatus("all")}
              className={clsx(
                propertySaleStatus === "all"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "rounded-md px-4 py-2 font-bold",
              )}
            >
              All
            </button>
            <button
              onClick={() => setPropertySaleStatus("sale")}
              className={clsx(
                propertySaleStatus === "sale"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "rounded-md px-4 py-2 font-bold",
              )}
            >
              Sale
            </button>
            <button
              onClick={() => setPropertySaleStatus("rent")}
              className={clsx(
                propertySaleStatus === "rent"
                  ? "bg-white text-blueColor"
                  : "bg-blueColor text-white",
                "rounded-md px-4 py-2 font-bold",
              )}
            >
              Rent
            </button>
          </div>
          <div className="mb-4 flex flex-col space-y-4 rounded-md bg-white p-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex flex-1 flex-col">
              <label className="mb-1 text-sm font-semibold">Type</label>
              <select
                className="rounded-md border-gray-300 bg-gray-100 px-4 py-2"
                value={propertySaleStatus}
                onChange={(e) => setPropertySaleStatus(e.target.value)}
              >
                <option value="all">All Type</option>
                <option value="rent">Rent</option>
                <option value="sale">Sell</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col">
              <label className="mb-1 text-sm font-semibold">Category</label>
              <select
                className="rounded-md border-gray-300 bg-gray-100 px-4 py-2"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
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
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <button
              onClick={searchHandler}
              className="rounded-md bg-blueColor px-4 py-2 font-bold text-white hover:bg-blueColor"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
