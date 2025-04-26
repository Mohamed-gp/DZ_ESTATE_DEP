"use client";
import { useEffect, useState } from "react";
import { Search, MapPin, Building, Home } from "lucide-react";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
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
    <div className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/heroImage.jpg)",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>

      <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-24">
        <div className="w-full max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              {t("find_home")} <span className="text-blue-400">Estatery</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-200">
              {t("platform_description")}
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Property type selector */}
            <div className="mb-6 flex justify-center gap-2">
              {["all", "sale", "rent"].map((status) => (
                <button
                  key={status}
                  onClick={() => setPropertySaleStatus(status)}
                  className={`relative rounded-full px-8 py-3 font-medium transition-all duration-300 ${
                    propertySaleStatus === status
                      ? "bg-white text-blue-600 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {status === "all" && (
                    <Home className="mr-2 inline-block h-4 w-4" />
                  )}
                  {status === "sale" && (
                    <Building className="mr-2 inline-block h-4 w-4" />
                  )}
                  {status === "rent" && (
                    <MapPin className="mr-2 inline-block h-4 w-4" />
                  )}
                  {t(status)}
                </button>
              ))}
            </div>

            {/* Search form */}
            <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur-sm">
              <div className="grid gap-4 p-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("type")}
                  </label>
                  <div className="group relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none"
                      value={propertySaleStatus}
                      onChange={(e) => setPropertySaleStatus(e.target.value)}
                    >
                      <option value="all">{t("all")}</option>
                      <option value="rent">{t("rent")}</option>
                      <option value="sale">{t("sale")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("category")}
                  </label>
                  <div className="group relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="" disabled>
                        {t("select_category")}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("keyword")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("enter_keyword")}
                      className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 pl-10 text-gray-700 focus:border-blue-500 focus:outline-none"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4">
                <button
                  onClick={searchHandler}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t("search")}
                </button>
              </div>
            </div>

            {/* Stats section */}
            <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { count: "200+", label: "Properties" },
                { count: "50+", label: "Cities" },
                { count: "10k+", label: "Satisfied Clients" },
                { count: "4.8", label: "Average Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.count}</p>
                  <p className="text-blue-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default Hero;
