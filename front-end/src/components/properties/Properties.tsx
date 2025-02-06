"use client";
import customAxios from "@/utils/customAxios";
import PropertyCard from "../propertyCard/PropertyCard";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const Properties = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);

  const getProperties = async () => {
    try {
      const { data } = await customAxios.get("/properties", {
        params: Object.fromEntries(searchParams.entries()),
      });
      setProperties(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProperties();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      {properties?.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-gray-700">
            {t("noPropertiesFound")}
          </p>
          <p className="text-gray-500">{t("adjustSearchCriteria")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {properties?.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
