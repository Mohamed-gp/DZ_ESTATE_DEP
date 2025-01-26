"use client";
import React, { useEffect, useState } from "react";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Currency,
  ImagePlus,
  Clock,
  Folder,
} from "lucide-react";
import customAxios from "@/utils/customAxios";
import AddLocationInput from "@/components/addProperty/AddLocationInput";
import toast from "react-hot-toast";
import AddPropertyImages from "@/components/addProperty/AddPropertyImages";

interface PropertyFormData {
  title: string;
  status: "rent" | "sell";
  price: number;
  category: string;
  description: string;
  longitude: number;
  latitude: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  files: [];
  wilaya: number;
  commune: string;
  quartier: string;
}

const PropertyForm = () => {
  const [dataToSubmit, setDataToSubmit] = useState<PropertyFormData>({
    title: "",
    status: "rent",
    price: 0,
    category: "",
    longitude: 3.086472,
    latitude: 36.737232,
    wilaya: 42,
    commune: "",
    quartier: "",
    description: "",
    guests: 0,
    bedrooms: 0,
    bathrooms: 0,
    files: [],
  });

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log(dataToSubmit);
      const formData = new FormData();
      formData.append("title", dataToSubmit.title);
      formData.append("status", dataToSubmit.status);
      formData.append("price", dataToSubmit.price.toString());
      formData.append("category", dataToSubmit.category);
      formData.append("guests", dataToSubmit.guests.toString());
      formData.append("longitude", dataToSubmit.longitude.toString());
      formData.append("latitude", dataToSubmit.latitude.toString());
      formData.append("wilaya", dataToSubmit.wilaya.toString());
      formData.append("commune", dataToSubmit.commune);
      formData.append("quartier", dataToSubmit.quartier);
      formData.append("description", dataToSubmit.description);
      formData.append("bedrooms", dataToSubmit.bedrooms.toString());
      formData.append("bathrooms", dataToSubmit.bathrooms.toString());

      if (dataToSubmit.files && dataToSubmit.files?.length > 0) {
        for (let i = 0; i < dataToSubmit.files.length; i++) {
          formData.append("files", dataToSubmit.files[i]);
        }
      }
      const { data } = await customAxios.post("/properties/add", formData);
      toast.success(data.message);
    } catch (error) {
      console.log(error)
      // toast.error(error.response.data.message);
      // console.error(error);
    }
  };
  const [categories, setCategories] = useState([
    { name: "Beach", _id: "1" },
    { name: "Countryside", _id: "2" },
  ]);
  const getPropertiesCategories = async () => {
    try {
      const { data } = await customAxios.get("/properties/categories");
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // getPropertiesCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Home className="h-6 w-6" />
            Add New Property
          </h1>
        </div>

        <form className="space-y-8 p-6" onSubmit={(e) => submitHandler(e)}>
          {/* Property Type and Price */}
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Home className="h-5 w-5 text-blue-600" />
              Property Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Property Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Home className="h-4 w-4 text-blue-600" />
                  Property Type
                </label>
                <select
                  className={`w-full rounded-lg border border-gray-300 bg-white p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  onChange={(e) => {
                    if (e.target.value == "rent" || e.target.value == "sell") {
                      setDataToSubmit({
                        ...dataToSubmit,
                        status: e.target.value,
                      });
                    }
                  }}
                >
                  <option value="rent">For Rent</option>
                  <option value="sell">For Sale</option>
                </select>
              </div>
              {/* Price Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Currency className="h-4 w-4 text-blue-600" />
                  Price
                </label>
                <input
                  type="number"
                  className={`w-full rounded-lg border border-gray-300 bg-white p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter price"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      price: +e.target.value,
                    });
                  }}
                  min={0}
                />
              </div>

              {/* Unit Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Folder className="h-4 w-4 text-blue-600" />
                  Category
                </label>
                <select
                  className={`w-full rounded-lg border border-gray-300 bg-white p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      category: e.target.value,
                    });
                  }}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Wilaya
                </label>
                <input
                  type="text"
                  className={`"border-gray-300 w-full rounded-lg border p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter wilaya"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      wilaya: +e.target.value,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Commune
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter commune"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      commune: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quartier
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter quartier"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      quartier: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* localistaion via google map  */}
          <AddLocationInput
            dataToSubmit={dataToSubmit}
            setDataToSubmit={setDataToSubmit}
            inputLabel="location"
          />

          {/* Property Details */}
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Home className="h-5 w-5 text-blue-600" />
              Property Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Square className="h-4 w-4 text-blue-600" />
                  Guests
                </label>
                <input
                  type="number"
                  className={`border-gray-300} w-full rounded-lg border p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter area"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      guests: +e.target.value,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BedDouble className="h-4 w-4 text-blue-600" />
                  Bedrooms
                </label>
                <input
                  type="number"
                  className={`border-gray-300} w-full rounded-lg border p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Number of bedrooms"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      bedrooms: +e.target.value,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bath className="h-4 w-4 text-blue-600" />
                  Bathrooms
                </label>
                <input
                  type="number"
                  className={`w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  placeholder="Number of bathrooms"
                  onChange={(e) => {
                    setDataToSubmit({
                      ...dataToSubmit,
                      bathrooms: +e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              className={`"border-gray-300" w-full rounded-lg border p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter property description"
              onChange={(e) => {
                setDataToSubmit({
                  ...dataToSubmit,
                  title: e.target.value,
                });
              }}
            />
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className={`"border-gray-300" h-32 w-full rounded-lg border p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter property description"
              onChange={(e) => {
                setDataToSubmit({
                  ...dataToSubmit,
                  description: e.target.value,
                });
              }}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ImagePlus className="h-4 w-4 text-blue-600" />
              Property Images
            </label>
            {/* <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <input
                type="file"
                className="hidden"
                id="images"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setDataToSubmit({
                      ...dataToSubmit,
                      files: e.target.files,
                    });
                    handleImageChange(e);
                  }
                }}
              />
              <label htmlFor="images" className="cursor-pointer">
                <div className="space-y-2">
                  <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </label>
            </div> */}
            <AddPropertyImages
              dataToSubmit={dataToSubmit}
              setDataToSubmit={setDataToSubmit}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-900"
          >
            <Home className="h-5 w-5" />
            Add Property
          </button>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
