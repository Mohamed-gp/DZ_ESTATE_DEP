"use client";

import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Bath, Bed, Folder, Heart, Home, Loader2, Trash } from "lucide-react";
import uuid from "@/utils/uuid";
import customAxios from "@/utils/customAxios";
import toast from "react-hot-toast";
import useBoundStore from "@/store/store";
import Link from "next/link";

interface PropertyCardProps {
  property: any;
  onFavorite?: (id: string) => void;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { user } = useBoundStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [remove, setRemove] = useState(0);

  const statusColor =
    property.status === "rent"
      ? "bg-blue-500 text-white"
      : "bg-green-500 text-white";

  const handleFavorite = (id: string) => {
    // setProperties(
    //   properties?.map((property) =>
    //     property.id === id
    //       ? { ...property, isFavorite: !property.isFavorite }
    //       : property,
    //   ),
    // );
  };

  const removeHandler = (id) => {
    Swal.fire({
      title: "Are you sure to remove this Property?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await customAxios.delete(`/properties/${id}`);
          Swal.fire({
            title: "Deleted!",
            text: "Property Deleted Successfuly",
            icon: "success",
          });

          setRemove((prev) => prev + 1);
        } catch (error) {
          console.log(error);
          toast.error(error?.response?.data.message);
        }
      } else {
        Swal.fire({
          title: "your profile is safe!",
          text: "something went wrong",
          icon: "error",
        });
      }
    });
  };
  useEffect(() => {
    // getAllPropertiesHandler();
  }, [remove]);

  return (
    <Link
      href={"/properties/" + property?.id}
      className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-gray-100 ${imageLoading ? "block" : "hidden"} `}
        >
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
        {property?.assets.map((asset: any, index: number) => {
          return (
            <div key={uuid()}>
              {property?.assets[index]?.type == "image" && (
                <Image
                  src={property?.assets[0]?.url}
                  alt={property?.title}
                  fill
                  className={`object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 ${imageLoading ? "opacity-0" : "opacity-100"} `}
                  onLoadingComplete={() => setImageLoading(false)}
                  // onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
          );
        })}

        {/* Favorite Button */}
        <button
          onClick={() => handleFavorite(property.id)}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110 hover:bg-white"
        >
          <Heart
            className={`h-5 w-5 duration-300 hover:fill-red-500 hover:text-red-500 ${property.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>
        {property?.owner_id == user?.id && (
          <button
            onClick={() => removeHandler(property.id)}
            className="absolute right-14 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110 hover:bg-white"
          >
            <Trash className={`h-5 w-5`} />
          </button>
        )}
        {/* Status Badge */}
        <div
          className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-sm font-medium ${statusColor} `}
        >
          {property?.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h2 className="mb-1 text-xl font-bold text-gray-900">
            {property?.title}
          </h2>
          <p className="text-sm text-gray-600">{property?.address}</p>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-bold text-blue-600">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600">/month</span>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 p-2">
              <Bed className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm">
              <span className="font-medium">{property?.bedrooms}</span>
              <span className="text-gray-600"> Beds</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 p-2">
              <Bath className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm">
              <span className="font-medium">{property?.bathrooms}</span>
              <span className="text-gray-600"> Baths</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 p-2">
              <Folder className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <span className="font-medium">{property?.category.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
