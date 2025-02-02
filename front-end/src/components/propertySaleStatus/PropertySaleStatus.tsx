"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

const PropertySaleStatus = () => {
  const searchParams = useSearchParams();
  const [propertySaleType, setPropertySaleType] = useState(
    searchParams.get("status") || "all",
  );
  const router = useRouter();
  const selectSaleStatus = (status: string) => {
    setPropertySaleType(status);
    const params = new URLSearchParams(window.location.search);
    if (status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="my-12 flex justify-center">
      <button
        onClick={() => selectSaleStatus("all")}
        className={clsx(
          propertySaleType === "all"
            ? "bg-white text-blueColor"
            : "bg-blueColor text-white",
          "border-2 border-blueColor px-9 py-4 font-bold",
        )}
      >
        All
      </button>
      <button
        onClick={() => selectSaleStatus("sell")}
        className={clsx(
          propertySaleType === "sell"
            ? "bg-white text-blueColor"
            : "bg-blueColor text-white",
          "border-2 border-blueColor px-9 py-4 font-bold",
        )}
      >
        Sell
      </button>
      <button
        onClick={() => selectSaleStatus("rent")}
        className={clsx(
          propertySaleType === "rent"
            ? "bg-white text-blueColor"
            : "bg-blueColor text-white",
          "border-2 border-blueColor px-9 py-4 font-bold",
        )}
      >
        Rent
      </button>
    </div>
  );
};

export default PropertySaleStatus;
