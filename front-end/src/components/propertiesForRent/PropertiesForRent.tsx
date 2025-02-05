"use client";
import Link from "next/link";
import PropertyCard from "../propertyCard/PropertyCard";
import { useEffect, useState } from "react";
import customAxios from "@/utils/customAxios";
import { useTranslation } from 'react-i18next';
const PropertiesForRent = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    getPropertiesForRent();
  }, []);

  const getPropertiesForRent = async () => {
    try {
      const { data } = await customAxios.get("/properties?status=rent");
      setProperties(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="my-12 py-12">
      <div className="container flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{t("Properties for Rent")}</p>
          <Link href={"/properties"} className="text-blueColor">
            {t("See more")}
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-12">
          {properties.map((property, index) => (
            <PropertyCard key={index} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default PropertiesForRent;