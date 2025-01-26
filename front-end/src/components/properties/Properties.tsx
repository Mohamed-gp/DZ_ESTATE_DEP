"use client";
import customAxios from "@/utils/customAxios";
import PropertyCard from "../propertyCard/PropertyCard";
import { useEffect, useState } from "react";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const getProperties = async () => {
    try {
      const { data } = await customAxios.post("/properties");
      setProperties(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProperties();
  }, []);
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
export default Properties;
