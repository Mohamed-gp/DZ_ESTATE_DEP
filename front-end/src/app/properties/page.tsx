"use client";
import PropertySaleType from "@/components/propertySaleType/PropertySaleType";
import CategoriesAndFilterContainer from "@/components/categoriesAndFilterProperties/CategoriesAndFilterContainer";
import PropertiesAndMapContainer from "@/components/propertiesAndMapContainer/PropertiesAndMapContainer";
import { useEffect, useState } from "react";

const Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <>
      <PropertySaleType />
      <CategoriesAndFilterContainer />
      <PropertiesAndMapContainer />
    </>
  );
};

export default Page;
