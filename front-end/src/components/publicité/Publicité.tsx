import Image from "next/image";
import React from "react";
import ouedKnissPub from "../../../public/ouedKniss.png";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
const Publicité = () => {
  const {  t } = useTranslation();
  return (
    <Link
    href={"https://www.ouedkniss.com/"}
    target="_blank"
    className="container my-12 flex flex-col gap-6"
  >
    <p className="text-2xl font-bold">{t("Advertisement")}</p>
    <div className="w-full">
      <Image src={ouedKnissPub} alt={t("Advertisement Image")} />
    </div>
  </Link>
  );
};

export default Publicité;
