"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import toast from "react-hot-toast";
import PropertyCard from "@/components/propertyCard/PropertyCard";
import { useTranslation } from "react-i18next";

export default function PropertiesPage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useBoundStore((state) => state);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get(`/properties/users/${user.id}`);
      console.log(data);
      setProperties(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []); // Added searchQuery to dependencies

  const filteredProperties = properties?.filter((property) =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProperties?.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties?.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">{t("account.posts.title")}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder={t("account.posts.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="pl-10"
          />
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
            <Link href="/properties/add" className="block">
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-6 text-center hover:border-gray-400 hover:bg-gray-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  {t("account.posts.addProperty")}
                </h3>
              </div>
            </Link>

            {paginatedProperties?.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard
                  property={property}
                  getProperties={fetchProperties}
                />
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
              {t("common.page")} {page} {t("common.of")} {totalPages}
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
