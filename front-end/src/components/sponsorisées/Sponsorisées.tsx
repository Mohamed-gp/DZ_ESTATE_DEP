import React from "react";
import PropertyCard from "../propertyCard/PropertyCard";
import Link from "next/link";

const Sponsorisées = () => {
  return (
    <div className="container flex flex-col my-12 gap-6">
      <div className="flex justify-between">
        <p className="font-bold text-2xl">Sponsorisées</p>

        <Link href={"/properties"} className="text-blueColor">
          See more{" "}
        </Link>
      </div>
      <div className="flex flex-wrap gap-12 justify-center">
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
      </div>
    </div>
  );
};

export default Sponsorisées;
