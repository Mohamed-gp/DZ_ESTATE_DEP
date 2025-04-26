"use client";
import { useEffect, useState } from "react";
import Featured from "@/components/featured/Featured";
import Hero from "@/components/hero/Hero";
import PropertiesForRent from "@/components/propertiesForRent/PropertiesForRent";
import PropertiesForSell from "@/components/propertiesForSell/PropertiesForSell";
import ContactUs from "@/components/contactUs/ContactUs";
import Subscribe from "@/components/Subscribe/Subscribe";
import useBoundStore from "@/store/store";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useBoundStore();
  const navigate = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (user?.role === "admin") {
      navigate.push("/admin/analytics");
    }
  }, [user, navigate]);

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <Hero />
      </section>

      {/* Decorative separator */}
      <div className="relative h-24">
        <svg
          className="absolute -top-1 left-0 w-full text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,112C672,117,768,171,864,197.3C960,224,1056,224,1152,213.3C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Featured Categories */}
      <section className="bg-white py-16">
        <Featured />
      </section>

      {/* Properties for Rent */}
      <section className="bg-gray-50 py-16">
        <PropertiesForRent />
      </section>

      {/* Properties for Sale */}
      <section className="bg-white py-16">
        <PropertiesForSell />
      </section>

      {/* Contact and Subscribe in a visually appealing layout */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <ContactUs />
            <Subscribe />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl"></div>
      </section>
    </main>
  );
}
