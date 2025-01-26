"use client";
import { useEffect, useState } from "react";
import customAxios from "@/utils/customAxios";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useParams } from "next/navigation";
import Image from "next/image";

const PhotosModel = () => {
  const [images, setimages] = useState([]);
  const { id } = useParams();
  const getHousePhotosById = async () => {
    try {
      const { data } = await customAxios.get(`/properties/${id}`);
      setimages(data.data.assets);
      console.log(data.data.assets);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getHousePhotosById();
  }, []);
  return (
    <div className="container relative my-12 flex items-center justify-center">
      <Link
        href={`/properties/${id}`}
        className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-blueColor px-2 text-white duration-300 hover:scale-105 sm:left-12 sm:translate-x-0"
      >
        <FaArrowLeftLong className="h-8 w-8 cursor-pointer rounded-lg p-2 text-xl" />
        <p className="text-sm">Back To The Property Page</p>
      </Link>
      <div className="mt-12 flex w-[50%] flex-col items-center justify-center gap-5">
        {images.map((image: any) => (
          <>
            {image.type === "image" ? (
              <img
                key={image?.url}
                src={image?.url}
                alt={image?.url}
                className="rounded-2xl"
              />
            ) : (
              <video
                key={image?.url}
                src={image?.url}
                autoPlay
                loop
                muted
                className="rounded-2xl"
              />
            )}
          </>
        ))}
      </div>
    </div>
  );
};
export default PhotosModel;
