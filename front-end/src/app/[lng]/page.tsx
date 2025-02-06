import Featured from "@/components/featured/Featured";
import Hero from "@/components/hero/Hero";
import Publicité from "@/components/publicité/Publicité";
// import Sponsorisées from "@/components/sponsorisées/Sponsorisées";
import PropertiesForRent from "@/components/propertiesForRent/PropertiesForRent";
import PropertiesForSell from "@/components/propertiesForSell/PropertiesForSell";
import ContactUs from "@/components/contactUs/ContactUs";
import Subscribe from "@/components/Subscribe/Subscribe";

export default function Home() {
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
