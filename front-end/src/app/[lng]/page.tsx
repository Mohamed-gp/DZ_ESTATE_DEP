"use client";
import Featured from "@/components/featured/Featured";
import Hero from "@/components/hero/Hero";
import Publicité from "@/components/publicité/Publicité";
// import Sponsorisées from "@/components/sponsorisées/Sponsorisées";
import PropertiesForRent from "@/components/propertiesForRent/PropertiesForRent";
import PropertiesForSell from "@/components/propertiesForSell/PropertiesForSell";
import ContactUs from "@/components/contactUs/ContactUs";
import Subscribe from "@/components/Subscribe/Subscribe";
import useBoundStore from "@/store/store";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useBoundStore();
  const navigate = useRouter();
  if (user?.role === "admin") {
    navigate.push("/admin/analytics");
  }
  return (
    <>
      <Hero />
      <Publicité />
      {/* <Sponsorisées /> */}
      <Featured />
      <PropertiesForRent />
      <PropertiesForSell />
      <ContactUs />
      <Subscribe />
      {/* subscribe */}
    </>
  );
}
