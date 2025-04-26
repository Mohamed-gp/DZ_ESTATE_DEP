"use client";
import Link from "next/link";
import PropertyCard from "../propertyCard/PropertyCard";
import { useEffect, useState } from "react";
import customAxios from "@/utils/customAxios";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

const PropertiesForRent = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPropertiesForRent();
  }, []);

  const getPropertiesForRent = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get("/properties?status=rent");
      setProperties(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {t("Properties for Rent")}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Discover perfect rental properties for your next home
            </p>
          </div>
          <Link
            href="/properties?status=rent"
            className="group mt-4 inline-flex items-center rounded-full bg-blue-50 px-6 py-2 text-blue-700 transition-all duration-200 hover:bg-blue-100 sm:mt-0"
          >
            {t("See more")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-lg bg-blue-50 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            No rental properties available
          </h3>
          <p className="mt-2 text-gray-600">
            Check back later for new listings
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property, index) => (
            <PropertyCard key={index} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesForRent;
