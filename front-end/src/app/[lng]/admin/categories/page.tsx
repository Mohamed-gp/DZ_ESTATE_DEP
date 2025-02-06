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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // Set the limit for items per page
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const { user } = useBoundStore((state) => state);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get(`/categories`, {
        params: { page, limit, search: searchQuery },
      });
      setCategories(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, searchQuery]);

  const handleAddCategory = async () => {
    try {
      const { data } = await customAxios.post(`/categories`, newCategory);
      setCategories([...categories, data.data]);
      setNewCategory({ name: "", description: "" });
      toast.success("Category added successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      await customAxios.delete(`/categories/${categoryId}`);
      setCategories(
        categories.filter((category) => category.id !== categoryId),
      );
      toast.success("Category removed successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories?.length / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedCategories = filteredCategories?.slice(
    startIndex,
    startIndex + limit,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">Manage Categories</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search Categories"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Add New Category</h2>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="flex-1"
            />
            <Input
              type="text"
              placeholder="Category Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="flex-1"
            />
            <Button onClick={handleAddCategory}>
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
            {paginatedCategories?.map((category) => (
              <div
                key={category.id}
                className="relative flex flex-col items-center rounded border bg-white p-4 shadow"
              >
                <h2 className="mb-4 text-center text-lg font-semibold">
                  {category.name}
                </h2>
                <p className="text-center text-sm text-gray-600">
                  {category.description}
                </p>
                <div className="mt-4 flex gap-2">
                  {/* <Link href={`/admin/categories/edit/${category.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <FaEdit className="mr-2" /> Edit
                    </Button>
                  </Link> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCategory(category.id)}
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
