"use client";
import Featured from "@/components/featured/Featured";
import Hero from "@/components/hero/Hero";
import Publicité from "@/components/publicité/Publicité";
import Sponsorisées from "@/components/sponsorisées/Sponsorisées";
import PropertyCard from "@/components/propertyCard/PropertyCard";
import Link from "next/link";
import PropertiesForRent from "@/components/propertiesForRent/PropertiesForRent";
import PropertiesForSell from "@/components/propertiesForSell/PropertiesForSell";
import { Suspense } from 'react'


export default function Home() {
  return (
    <>
      
      <Hero />
      <Publicité />
      {/* <Sponsorisées /> */}
      <Featured />
      <PropertiesForRent />
      {/* <PropertiesForSell /> */}
    </>
  );
}
