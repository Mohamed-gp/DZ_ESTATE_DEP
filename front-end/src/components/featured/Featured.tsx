"use client";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building,
  Landmark,
  Hotel,
  Warehouse,
  Mountain,
  PalmtreeIcon,
  Waves,
} from "lucide-react";

// Map category names to appropriate icons
const getCategoryIcon = (name: string) => {
  const iconMap = {
    Apartment: Building,
    House: Home,
    Villa: Landmark,
    Hotel: Hotel,
    Office: Building,
    Studio: Warehouse,
    Cottage: Home,
    Penthouse: Building,
    Mountain: Mountain,
    Beach: Waves,
    Vacation: PalmtreeIcon,
  };

  // Default to Home icon if no match
  return iconMap[name] || Home;
};

const Featured = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  const getPropertiesCategories = async () => {
    try {
      const { data } = await customAxios.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const searchHandler = (category: string) => {
    try {
      router.push(`/properties?category=${category}`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPropertiesCategories();
  }, []);

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background decoration */}
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"></div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            <span className="relative">
              Featured Categories
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400"></span>
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
          >
            Browse our most popular property categories and find your dream home
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {categories.map((category: any, index) => {
            const IconComponent = getCategoryIcon(category?.name);

            return (
              <motion.div
                key={category?.name + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => searchHandler(category?.name)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-90"></div>

                <div className="relative h-full px-6 py-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full ${
                        hoveredIndex === index
                          ? "bg-white text-blue-600"
                          : "bg-blue-100 text-blue-600"
                      } transition-colors duration-300`}
                    >
                      <IconComponent
                        size={32}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-semibold ${
                      hoveredIndex === index ? "text-white" : "text-gray-900"
                    } transition-colors duration-300`}
                  >
                    {category?.name}
                  </h3>

                  <div
                    className={`mt-2 text-sm ${
                      hoveredIndex === index ? "text-blue-100" : "text-gray-500"
                    } transition-colors duration-300`}
                  >
                    {category?.description?.substring(0, 60) ||
                      "Find your perfect property"}
                  </div>

                  <div
                    className={`mt-4 inline-flex items-center text-sm font-medium ${
                      hoveredIndex === index ? "text-white" : "text-blue-600"
                    } transition-colors duration-300`}
                  >
                    Browse properties
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                        hoveredIndex === index ? "translate-x-1" : ""
                      }`}
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
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Featured;
