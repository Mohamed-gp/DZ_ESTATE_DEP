import Image from "next/image";
import React from "react";
import ouedKnissPub from "../../../public/ouedKniss.png";

const Publicité = () => {
  return (
    <div className="container flex flex-col my-12 gap-6">
      <p className="font-bold text-2xl">Publicité</p>
      <div className="w-full">
        <Image src={ouedKnissPub} alt="publicité"  />
      </div>
    </div>
  );
};

export default Publicité;
