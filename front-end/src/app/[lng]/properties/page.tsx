"use client";
import PropertySaleStatus from "@/components/propertySaleStatus/PropertySaleStatus";
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
    <div className="container">
      <PropertySaleStatus />
      <CategoriesAndFilterContainer />
      <PropertiesAndMapContainer />
    </div>
  );
};

export default Page;
