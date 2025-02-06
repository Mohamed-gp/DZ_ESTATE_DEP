"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  FaUsers,
  FaHome,
  FaShoppingCart,
  FaDollarSign,
  FaUserPlus,
  FaBuilding,
} from "react-icons/fa";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { user } = useBoundStore((state) => state);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data } = await customAxios.get(`/analytics`);
      setAnalyticsData(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-xl font-bold">
          Analytics Dashboard
        </h1>
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
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaUsers className="mb-4 text-4xl text-blue-500" />
              <h2 className="text-center text-lg font-semibold">Total Users</h2>
              <p className="text-center text-2xl">{analyticsData.totalUsers}</p>
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaHome className="mb-4 text-4xl text-green-500" />
              <h2 className="text-center text-lg font-semibold">
                Total Properties
              </h2>
              <p className="text-center text-2xl">
                {analyticsData.totalProperties}
              </p>
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaShoppingCart className="mb-4 text-4xl text-yellow-500" />
              <h2 className="text-center text-lg font-semibold">Total Sales</h2>
              <p className="text-center text-2xl">{analyticsData.totalSales}</p>
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaDollarSign className="mb-4 text-4xl text-red-500" />
              <h2 className="text-center text-lg font-semibold">
                Total Revenue
              </h2>
              <p className="text-center text-2xl">
                ${analyticsData.totalRevenue}
              </p>
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaUserPlus className="mb-4 text-4xl text-purple-500" />
              <h2 className="text-center text-lg font-semibold">
                New Users This Month
              </h2>
              <p className="text-center text-2xl">
                {analyticsData.newUsersThisMonth}
              </p>
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <FaBuilding className="mb-4 text-4xl text-teal-500" />
              <h2 className="text-center text-lg font-semibold">
                New Properties This Month
              </h2>
              <p className="text-center text-2xl">
                {analyticsData.newPropertiesThisMonth}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <h2 className="mb-4 text-center text-lg font-semibold">
                User Growth
              </h2>
              <CircularProgressbar
                value={analyticsData.newUsersThisMonth}
                maxValue={analyticsData.totalUsers}
                text={`${((analyticsData.newUsersThisMonth / analyticsData.totalUsers) * 100).toFixed(2)}%`}
                styles={buildStyles({
                  textColor: "#4A5568",
                  pathColor: "#3182CE",
                  trailColor: "#E2E8F0",
                })}
              />
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <h2 className="mb-4 text-center text-lg font-semibold">
                Property Growth
              </h2>
              <CircularProgressbar
                value={analyticsData.newPropertiesThisMonth}
                maxValue={analyticsData.totalProperties}
                text={`${((analyticsData.newPropertiesThisMonth / analyticsData.totalProperties) * 100).toFixed(2)}%`}
                styles={buildStyles({
                  textColor: "#4A5568",
                  pathColor: "#38A169",
                  trailColor: "#E2E8F0",
                })}
              />
            </div>
            <div className="flex flex-col items-center rounded border bg-white p-4 shadow">
              <h2 className="mb-4 text-center text-lg font-semibold">
                Revenue Growth
              </h2>
              <CircularProgressbar
                value={analyticsData.totalRevenue}
                maxValue={1000000} // Assuming 1,000,000 as a max value for demonstration
                text={`$${analyticsData.totalRevenue}`}
                styles={buildStyles({
                  textColor: "#4A5568",
                  pathColor: "#D69E2E",
                  trailColor: "#E2E8F0",
                })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
