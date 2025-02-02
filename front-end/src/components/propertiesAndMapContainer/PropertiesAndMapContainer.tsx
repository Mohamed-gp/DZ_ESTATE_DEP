"use client";
import { Suspense, useEffect, useState } from "react";
import Properties from "../properties/Properties";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../map/Map"), { ssr: false });

const PropertiesAndMapContainer = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return (
    <section className="container mb-24 flex flex-col-reverse items-center justify-between gap-12 sm:flex-row sm:items-start lg:flex-wrap xl:flex-nowrap">
      <Suspense fallback={<div>Loading...</div>}>
        <Properties />
      </Suspense>
      <Map />
    </section>
  );
};
export default PropertiesAndMapContainer;
