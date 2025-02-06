"use client";
import customAxios from "@/utils/customAxios";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await customAxios.post("/subscribers", { email });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="subscribe container mx-auto my-8 mb-20 rounded-lg bg-white p-6 text-center shadow-lg">
      <h2 className="mb-4 text-3xl font-bold" style={{ color: "#1563DF" }}>
        Subscribe to Our Newsletter
      </h2>
      <form className="flex flex-col items-center" onSubmit={handleSubmit}>
        <div className="mb-4 w-full max-w-md">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default Subscribe;
