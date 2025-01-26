"use client";
import React, { useState } from "react";
import clsx from "clsx";

const PropertySaleType = () => {
  const [propertySaleType, setPropertySaleType] = useState("all");

  return (
    <div className="flex justify-center my-12">
      <button
        onClick={() => setPropertySaleType("all")}
        className={clsx(
          propertySaleType === "all"
            ? "bg-white  text-blueColor "
            : "bg-blueColor  text-white",
          "font-bold py-4 px-9 border-2 border-blueColor"
        )}
      >
        All
      </button>
      <button
        onClick={() => setPropertySaleType("sale")}
        className={clsx(
          propertySaleType === "sale"
            ? "bg-white  text-blueColor "
            : "bg-blueColor  text-white",
          "font-bold py-4 px-9 border-2 border-blueColor"
        )}
      >
        Sale
      </button>
      <button
        onClick={() => setPropertySaleType("rent")}
        className={clsx(
          propertySaleType === "rent"
            ? "bg-white  text-blueColor "
            : "bg-blueColor  text-white",
          "font-bold py-4 px-9 border-2 border-blueColor"
        )}
      >
        Rent
      </button>
    </div>
  );
};

export default PropertySaleType;
