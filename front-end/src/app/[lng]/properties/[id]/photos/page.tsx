"use client";
import { useEffect, useState } from "react";
import customAxios from "@/utils/customAxios";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, ImageOff, Play } from "lucide-react";

interface Asset {
  id: string;
  url: string;
  type: "image" | "video";
}

interface PropertyData {
  id: string;
  title: string;
  assets: Asset[];
}

const PhotosModel = () => {
  const [images, setImages] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { id } = useParams<{ id: string }>();

  const handleImageError = (assetId: string) => {
    setImageErrors((prev) => ({ ...prev, [assetId]: true }));
  };

  useEffect(() => {
    const getHousePhotosById = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data } = await customAxios.get<{ data: PropertyData }>(
          `/properties/${id}`,
        );
        setImages(data.data.assets || []);
      } catch {
        setError("Failed to load property images. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getHousePhotosById();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600">Loading property images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="rounded-xl bg-red-50 p-8 text-red-800">
          <p className="mb-2 font-medium">{error}</p>
          <button
            onClick={getHousePhotosById}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <ImageOff className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            No images available
          </h2>
          <p className="mb-6 text-gray-600">
            This property doesn&apos;t have any photos to display
          </p>
          <Link
            href={`/properties/${id}`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={`/properties/${id}`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to property</span>
        </Link>
        <h1 className="text-xl font-bold md:text-2xl">
          Property Gallery{" "}
          <span className="text-gray-500">({images.length} items)</span>
        </h1>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {images.map((asset) => (
          <div
            key={asset.id || asset.url}
            className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
          >
            {asset.type === "video" ? (
              <div className="relative aspect-video w-full">
                <video
                  src={asset.url}
                  controls
                  playsInline
                  className="h-full w-full rounded-t-xl object-cover"
                />
              </div>
            ) : imageErrors[asset.id] ? (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center text-gray-400">
                  <ImageOff className="mb-2 h-12 w-12" />
                  <p>Image not available</p>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={asset.url}
                  alt="Property image"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  priority={images.indexOf(asset) < 3}
                  onError={() => handleImageError(asset.id)}
                />
              </div>
            )}

            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center text-sm text-gray-500">
                {asset.type === "video" ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    <span>Video</span>
                  </>
                ) : (
                  <>
                    <ImageOff className="mr-2 h-4 w-4" />
                    <span>Image {images.indexOf(asset) + 1}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosModel;
