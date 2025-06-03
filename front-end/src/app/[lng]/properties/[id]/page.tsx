"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Image from "next/image";
import customAxios from "@/utils/customAxios";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import Rating from "@/components/rating/Rating";
import Swal from "sweetalert2";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import useBoundStore from "@/store/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import PayementModel from "@/components/payementModel/PayementModel";
import {
  Star,
  Trash2,
  Grid,
  Phone,
  FileText,
  Bed,
  Bath,
  Users,
  Calendar,
  MessageCircle,
  MapPin,
  DollarSign,
  Loader2,
  Heart,
  ImageOff,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define TypeScript interfaces
interface Asset {
  id: string;
  url: string;
  type: "image" | "video";
}

interface User {
  id: string;
  username: string;
  profile_image: string;
  phone_number: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "rent" | "sale" | "sell";
  guests: number;
  bedrooms: number;
  bathrooms: number;
  owner_id: string;
  owner: User;
  assets: Asset[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface Review {
  id: string;
  user_id: string;
  username: string;
  profile_image: string;
  rating: number;
  comment: string;
}

interface DateSelection {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface UserState {
  id?: string;
}

const SingleProperty = () => {
  const { user } = useBoundStore() as { user: UserState | null };
  const { id } = useParams<{ id: string }>();
  const propertyId = Array.isArray(id) ? id[0] : id;

  // Use a ref to store the current image errors - prevents setState during render
  const imageErrorsRef = useRef<Record<string, boolean>>({});

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [review, setReview] = useState({
    rating: 5,
    comment: "",
  });
  const [state, setState] = useState<DateSelection[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [daysCount, setDaysCount] = useState<number>(0);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isPaymentModelOpen, setIsPaymentModelOpen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  // Use a static instance ID to help make unique keys that don't change between re-renders
  const instanceId = useRef<string>(
    `instance-${Math.random().toString(36).substring(2, 9)}`,
  ).current;

  // Create a memoized handler for each thumbnail - moved here to fix hook order
  const createThumbnailClickHandler = useCallback((index: number) => {
    return () => {
      setActiveImageIndex(index + 1);
    };
  }, []);

  // Use REF instead of state for image errors during render
  const handleImageError = useCallback((assetId: string) => {
    // Update ref directly - no setState during render!
    imageErrorsRef.current[assetId] = true;

    // Schedule state update for AFTER render is complete
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setImageErrors({ ...imageErrorsRef.current });
      }, 0);
    }
  }, []);

  // Pre-computed asset data to avoid inline function creation during render
  const assetThumbnails = useMemo(() => {
    if (!property || !property.assets) return [];

    return property.assets.slice(1, 5).map((asset, index) => {
      const thumbnailClickHandler = createThumbnailClickHandler(index);
      return {
        asset,
        index,
        clickHandler: thumbnailClickHandler,
        // Ensure unique key with multiple pieces of information
        uniqueKey: `thumb-${asset.id || "no-id"}-${index}-${property.id}`,
      };
    });
  }, [property, createThumbnailClickHandler]);

  const getHouseById = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get(`/properties/${propertyId}`);
      setProperty(data.data);

      // Check if the property is in the user's wishlist
      if (user?.id) {
        try {
          const { data: wishlistData } = await customAxios.get(
            `/user/wishlist/check/${propertyId}`,
          );
          setIsFavorite(wishlistData.inWishlist);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const getHouseReviews = async () => {
    try {
      const { data } = await customAxios.get(`/reviews/${propertyId}`);
      setReviews(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load reviews");
    }
  };

  useEffect(() => {
    if (propertyId) {
      getHouseById();
      getHouseReviews();
    }
  }, [propertyId]);

  useEffect(() => {
    if (state[0].endDate) {
      const difference =
        state[0].endDate.getTime() - state[0].startDate.getTime();
      const daysDifference = Math.ceil(difference / (1000 * 3600 * 24));
      setDaysCount(daysDifference);
    }
  }, [state]);

  const messageHouseHandler = async () => {
    try {
      if (!user?.id) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const { data } = await customAxios.post(`/chat/rooms`, {
        propertyId: propertyId,
        firstUserId: user.id,
      });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  };

  const toggleFavorite = async () => {
    try {
      await customAxios.post(`/user/wishlist/toggle/${propertyId}`);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removed from wishlist" : "Added to wishlist");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update wishlist",
      );
    }
  };

  const addReviewHandler = async () => {
    try {
      if (!review.comment.trim()) {
        toast.error("Please enter a comment");
        return;
      }

      const { data } = await customAxios.post(`/reviews`, {
        rating: 6 - review.rating,
        comment: review.comment,
        property_id: propertyId,
      });

      getHouseReviews();
      setReview({ rating: 5, comment: "" });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add review");
    }
  };

  const deleteReviewHandler = (reviewId: string) => {
    Swal.fire({
      title: "Delete this review?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await customAxios.delete(`/reviews/${reviewId}`);
          getHouseReviews();
          toast.success(data.message);
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message || "Failed to delete review",
          );
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-130px)] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
        <p className="mt-4 text-gray-600">
          The property you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/properties"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Browse other properties
        </Link>
      </div>
    );
  }

  const isRentProperty = property.status?.toLowerCase() === "rent";
  const normalizedPrice = property.price.toLocaleString();

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Property Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {property.title}
            </h1>
            <div className="mt-2 flex items-center text-gray-600">
              <MapPin className="mr-1 h-4 w-4" />
              <span className="text-sm md:text-base">
                {property.address || "Location unavailable"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline rounded-lg bg-white p-4 shadow-sm">
            <DollarSign className="mr-1 h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {normalizedPrice}
            </span>
            {isRentProperty && (
              <span className="ml-1 text-sm text-gray-500">/month</span>
            )}
            {user?.id && (
              <button
                onClick={toggleFavorite}
                className="ml-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Property Gallery - Improved Vertical Alignment */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:shadow-xl">
          <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-4 md:gap-3 lg:gap-3 lg:p-3">
            {/* Main large image - fixed vertical alignment */}
            <div className="relative col-span-1 row-span-2 h-80 overflow-hidden rounded-lg md:col-span-2 md:h-auto md:min-h-[400px]">
              {property.assets && property.assets[0] ? (
                property.assets[0].type === "video" ? (
                  <div className="group relative h-full w-full overflow-hidden rounded-lg">
                    <video
                      src={property.assets[0].url}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : imageErrorsRef.current[property.assets[0].id] ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <div className="flex flex-col items-center text-gray-500">
                      <ImageOff className="mb-2 h-12 w-12" />
                      <p className="text-sm font-medium">Image not available</p>
                    </div>
                  </div>
                ) : (
                  <div className="group relative h-full w-full overflow-hidden rounded-lg">
                    <Image
                      src={property.assets[0].url}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      quality={90}
                      onError={() => handleImageError(property.assets[0].id)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 ease-in-out group-hover:bg-opacity-10"></div>
                  </div>
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
                  <div className="flex flex-col items-center text-gray-500">
                    <ImageOff className="mb-2 h-12 w-12" />
                    <p className="text-sm font-medium">No images available</p>
                  </div>
                </div>
              )}
              <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-md">
                {isRentProperty ? "For Rent" : "For Sale"}
              </div>
            </div>

            {/* Smaller images - vertically aligned with main image */}
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 md:col-span-2 md:col-start-3 md:gap-3">
              {assetThumbnails.map(
                ({ asset, index, clickHandler, uniqueKey }) => (
                  <div
                    key={uniqueKey}
                    className="relative h-full w-full overflow-hidden rounded-lg"
                    style={{ height: "calc(40vw / 2)" }}
                  >
                    {asset.type === "video" ? (
                      <div
                        className="group relative h-full w-full cursor-pointer overflow-hidden"
                        onClick={clickHandler}
                      >
                        <video
                          src={asset.url}
                          className="h-full w-full object-cover"
                          playsInline
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : imageErrorsRef.current[asset.id] ? (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <ImageOff className="h-8 w-8 text-gray-400" />
                      </div>
                    ) : (
                      <div
                        className="group relative h-full w-full cursor-pointer overflow-hidden"
                        onClick={clickHandler}
                      >
                        <Image
                          src={asset.url}
                          alt={`Property image ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          onError={() => handleImageError(asset.id)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 ease-in-out group-hover:bg-opacity-20"></div>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>

            {/* View all photos button - better positioned and styled */}
            <Link
              href={`/properties/${propertyId}/photos`}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-lg md:bottom-6 md:right-6"
            >
              <Grid className="h-4 w-4 text-blue-600" />
              <span className="text-sm">View all photos</span>
            </Link>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
          {/* Left column - Property details */}
          <div className="md:col-span-2">
            {/* Property features */}
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    {isRentProperty ? "Property for rent" : "Property for sale"}
                  </h2>
                  <p className="text-gray-600">
                    Listed by {property.owner.username}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-blue-100 p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium">{property.guests}</span>
                      <span className="ml-1 text-gray-600">guests</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-blue-100 p-2">
                      <Bed className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="ml-1 text-gray-600">bedrooms</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-blue-100 p-2">
                      <Bath className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="ml-1 text-gray-600">bathrooms</span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* Property description */}
              <div className="prose max-w-none">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  About this property
                </h3>
                <p className="whitespace-pre-line text-gray-700">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Seller profile */}
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Seller Profile
              </h2>
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-blue-100">
                  {property.owner.profile_image &&
                  !imageErrorsRef.current["owner"] ? (
                    <Image
                      src={property.owner.profile_image}
                      alt={property.owner.username}
                      fill
                      className="object-cover"
                      onError={() => handleImageError("owner")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-blue-500">
                      {property.owner.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {property.owner.username}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-blue-600" />
                      <span>
                        {property.owner.phone_number || "No phone provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {property.owner_id !== user?.id && user && (
                  <button
                    onClick={messageHouseHandler}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-2 inline-block h-4 w-4" />
                    Message
                  </button>
                )}

                {!user && (
                  <Link
                    href="/auth/login"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    Login to contact
                  </Link>
                )}
              </div>
            </div>

            {/* Map section */}
            {property.latitude && property.longitude && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Location
                </h2>
                <div className="h-[400px] overflow-hidden rounded-lg">
                  <MapContainer
                    className="h-full w-full"
                    zoom={14}
                    center={[property.latitude, property.longitude]}
                    scrollWheelZoom={false}
                  >
                    <LayersControl>
                      <LayersControl.BaseLayer checked name="Standard Map">
                        <TileLayer
                          attribution="Google Maps"
                          url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                        />
                      </LayersControl.BaseLayer>
                      <LayersControl.BaseLayer name="Satellite">
                        <LayerGroup>
                          <TileLayer
                            attribution="Google Maps Satellite"
                            url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                          />
                        </LayerGroup>
                      </LayersControl.BaseLayer>
                    </LayersControl>
                    <Marker position={[property.latitude, property.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold">{property.title}</p>
                          <p className="text-sm text-gray-600">
                            Property Location
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Reviews section */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <div className="flex items-center rounded-full bg-blue-100 px-3 py-1">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="font-medium">
                    {reviews.length > 0
                      ? (
                          reviews.reduce(
                            (acc, review) => acc + review.rating,
                            0,
                          ) / reviews.length
                        ).toFixed(1)
                      : "No ratings"}
                  </span>
                  <span className="ml-1 text-gray-600">({reviews.length})</span>
                </div>
              </div>

              {/* Add review form */}
              {property.owner_id !== user?.id && user && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Write a Review
                  </h3>
                  <textarea
                    value={review.comment}
                    onChange={(e) =>
                      setReview({ ...review, comment: e.target.value })
                    }
                    className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Share your experience with this property..."
                    rows={4}
                  ></textarea>

                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        Rating:
                      </span>
                      <div className="flex">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <button
                            key={`star-${star}-${instanceId}-${property.id}`}
                            type="button"
                            onClick={() =>
                              setReview({ ...review, rating: star })
                            }
                            className="p-1"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                review.rating <= star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {6 - review.rating}/5
                      </span>
                    </div>
                    <button
                      onClick={addReviewHandler}
                      disabled={!review.comment.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((reviewItem, idx) => (
                    <div
                      key={`review-${reviewItem.id}-${idx}-${instanceId}`}
                      className="rounded-lg border border-gray-100 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full bg-blue-100">
                            {reviewItem.profile_image &&
                            !imageErrorsRef.current[reviewItem.id] ? (
                              <Image
                                src={reviewItem.profile_image}
                                alt={reviewItem.username}
                                fill
                                className="object-cover"
                                onError={() => handleImageError(reviewItem.id)}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-blue-500">
                                {reviewItem.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {reviewItem.username}
                            </h4>
                            <div className="flex items-center">
                              <Rating rating={reviewItem.rating} />
                            </div>
                          </div>
                        </div>

                        {reviewItem.user_id === user?.id && (
                          <button
                            onClick={() => deleteReviewHandler(reviewItem.id)}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-gray-700">{reviewItem.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">
                    No reviews yet. Be the first to review this property!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Booking/Contact */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-4 border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
                  {isRentProperty
                    ? "Book this property"
                    : "Purchase this property"}
                </h2>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">
                      {isRentProperty ? "Price per month" : "Price"}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${normalizedPrice}
                    </span>
                  </div>
                </div>

                {property.owner_id !== user?.id && user && (
                  <>
                    {isRentProperty ? (
                      <>
                        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                          <div className="bg-gray-50 p-3 text-center text-sm font-medium">
                            <Calendar className="mr-2 inline-block h-4 w-4" />
                            Select dates
                          </div>
                          <DateRange
                            key={`date-range-${instanceId}-${property.id}`}
                            editableDateInputs={true}
                            onChange={(item) => setState([item.selection])}
                            moveRangeOnFirstSelection={false}
                            ranges={state}
                            minDate={new Date()}
                            className="border-t border-gray-200"
                          />
                        </div>

                        {daysCount > 0 && (
                          <div className="mb-4 rounded-lg bg-blue-50 p-4">
                            <div className="mb-2 flex justify-between">
                              <span className="text-gray-700">
                                ${property.price} × {daysCount} nights
                              </span>
                              <span className="font-medium">
                                ${property.price * daysCount}
                              </span>
                            </div>
                            <div className="border-t border-blue-100 pt-2 font-bold">
                              <div className="flex justify-between">
                                <span>Total</span>
                                <span>${property.price * daysCount}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
                        <p className="font-medium">
                          This property is for sale.
                        </p>
                        <p className="mt-1 text-sm">
                          Purchase this property for a one-time payment.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setIsPaymentModelOpen(true)}
                      disabled={isRentProperty && daysCount === 0}
                      className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {isRentProperty ? "Reserve" : "Purchase"}
                    </button>
                  </>
                )}

                {!user && (
                  <Link
                    href="/auth/login"
                    className="block w-full rounded-lg bg-blue-600 py-3 text-center font-medium text-white transition-all hover:bg-blue-700"
                  >
                    Login to continue
                  </Link>
                )}

                {property.owner_id === user?.id && (
                  <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                    <p className="text-center font-medium">
                      This is your property
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModelOpen && property && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PayementModel
              state={state}
              property={property}
              daysCount={daysCount}
              setIsPaymentModelOpen={setIsPaymentModelOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SingleProperty;
