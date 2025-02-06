"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import toast from "react-hot-toast";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // Set the limit for items per page
  const [loading, setLoading] = useState(true);
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
  });
  const { user } = useBoundStore((state) => state);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get(`/features`, {
        params: { page, limit, search: searchQuery },
      });
      setFeatures(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [page, searchQuery]);

  const handleAddFeature = async () => {
    try {
      const { data } = await customAxios.post(`/features`, newFeature);
      setFeatures([...features, data.data]);
      setNewFeature({ title: "", description: "" });
      toast.success("Feature added successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      await customAxios.delete(`/features/${featureId}`);
      setFeatures(features.filter((feature) => feature.id !== featureId));
      toast.success("Feature removed successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const filteredFeatures = features?.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredFeatures?.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedFeatures = filteredFeatures?.slice(
    startIndex,
    startIndex + limit,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">Manage Features</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search Features"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Add New Feature</h2>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Feature Title"
              value={newFeature.title}
              onChange={(e) =>
                setNewFeature({ ...newFeature, title: e.target.value })
              }
              className="flex-1"
            />
            <Input
              type="text"
              placeholder="Feature Description"
              value={newFeature.description}
              onChange={(e) =>
                setNewFeature({ ...newFeature, description: e.target.value })
              }
              className="flex-1"
            />
            <Button onClick={handleAddFeature}>
              <Plus className="mr-2" /> Add
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedFeatures?.map((feature) => (
              <div
                key={feature.id}
                className="relative flex flex-col items-center rounded border bg-white p-4 shadow"
              >
                <h2 className="mb-4 text-center text-lg font-semibold">
                  {feature.title}
                </h2>
                <p className="text-center text-sm text-gray-600">
                  {feature.description}
                </p>
                <div className="mt-4 flex gap-2">
                  {/* <Link href={`/admin/features/edit/${feature.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <FaEdit className="mr-2" /> Edit
                    </Button>
                  </Link> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFeature(feature.id)}
                  >
                    <FaTrash className="mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
