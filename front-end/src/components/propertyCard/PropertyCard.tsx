"use client";

import { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { Bath, Bed, Folder, Heart, Loader2, Trash } from "lucide-react";
import customAxios from "@/utils/customAxios";
import toast from "react-hot-toast";
import useBoundStore from "@/store/store";
import Link from "next/link";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";

// Define proper TypeScript interfaces
interface Asset {
  id: string;
  url: string;
  type: "image" | "video";
}

interface Category {
  id: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string; // Changed from "rent" | "sale" to allow for other values
  bedrooms: number;
  bathrooms: number;
  category: Category;
  assets: Asset[];
  owner_id: string;
}

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  getProperties?: () => void;
}

const PropertyCard = ({ property, getProperties }: PropertyCardProps) => {
  const { user } = useBoundStore();
  const [imageLoading, setImageLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Property[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const getWishlist = async () => {
    try {
      const { data } = await customAxios.get(`/user/wishlist`);
      setWishlist(data.data);
    } catch (error) {
      toast.error(error?.response?.data.message || "Failed to load wishlist");
    }
  };

  useEffect(() => {
    if (user) {
      getWishlist();
    }
  }, [user]);

  const handleFavorite = async (id: string, e: MouseEvent) => {
    e.preventDefault();

    try {
      const { data } = await customAxios.post(`/user/wishlist/toggle/${id}`);
      setWishlist(data.wishlist);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data.message || "Failed to update wishlist");
    }
  };

  const removeHandler = (id: string, e: MouseEvent) => {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await customAxios.delete(`/admin/properties/${id}`);
          Swal.fire({
            title: "Deleted!",
            text: "Property deleted successfully",
            icon: "success",
          });
          if (getProperties) getProperties();
        } catch (error) {
          toast.error(
            error?.response?.data.message || "Failed to delete property",
          );
        }
      }
    });
  };

  const isFavorite = wishlist?.some((item) => item.id === property.id);
  const mainImage =
    property?.assets?.find((asset) => asset.type === "image")?.url ||
    "/placeholder-property.jpg";

  // Check if the property status indicates a sale (handle both "sale" and "sell")
  const normalizedStatus = property?.status?.toLowerCase() || "";
  const isRentProperty = normalizedStatus === "rent";

  // Apply the appropriate style based on the normalized status
  const statusClass = isRentProperty
    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
    : "bg-gradient-to-r from-green-600 to-green-500 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/properties/${property?.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Loading Overlay */}
          <AnimatePresence>
            {imageLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
              >
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Image */}
          <Image
            src={mainImage}
            alt={property?.title || "Property"}
            fill
            className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
            onLoadingComplete={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Status Badge */}
          <div
            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-sm font-medium shadow-md ${statusClass}`}
          >
            {isRentProperty ? "For Rent" : "For Sale"}
          </div>

          {/* Favorite Button */}
          {user?.id && user.role !== "admin" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleFavorite(property?.id, e)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </motion.button>
          )}

          {/* Delete Button for Owner/Admin */}
          {(property?.owner_id === user?.id || user?.role === "admin") && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => removeHandler(property.id, e)}
              className="absolute right-14 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md"
            >
              <Trash className="h-5 w-5 text-red-500" />
            </motion.button>
          )}

          {/* Price tag - more visible position */}
          <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-blue-600 shadow-md">
            ${property.price.toLocaleString()}
            {isRentProperty && <span className="text-gray-600">/month</span>}
          </div>

          {/* Overlay Gradient for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2">
            <h2 className="mb-1 line-clamp-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {property?.title}
            </h2>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
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
                <Folder className="h-4 w-4 text-blue-500" />
              </div>
              <div className="truncate text-sm">
                <span className="font-medium">{property?.category?.name}</span>
              </div>
            </div>
          </div>

          {/* View details button that appears on hover */}
          <div
            className={`mt-4 text-center transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <span className="inline-flex items-center justify-center text-sm font-medium text-blue-600">
              View Details
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
