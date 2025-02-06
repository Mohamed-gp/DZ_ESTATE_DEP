import React from "react";
import { FaCheck, FaStar } from "react-icons/fa";

const page = () => {
  return (
    <section className="mx-auto min-h-screen max-w-5xl px-4 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold">Choose Your Plan</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Tier */}
        <div className="relative rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">Basic Plan</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$0</span>
              <span className="ml-1 text-gray-500">/month</span>
            </div>
          </div>

          <div className="mb-6">
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>List up to 3 properties</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Basic property details</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Upload up to 5 images per property</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Standard customer support</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Basic analytics</span>
              </li>
            </ul>
          </div>

          <button className="w-full rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
            Get Started
          </button>
        </div>

        {/* Premium Tier */}
        <div className="relative rounded-lg border-2 border-blue-500 bg-white p-6">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full bg-blue-500 px-8 py-1 text-white">
              <FaStar className="h-4 w-4" /> Recommended
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold">Premium Plan</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$50</span>
              <span className="ml-1 text-gray-500">/month</span>
            </div>
          </div>

          <div className="mb-6">
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Unlimited property listings</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Featured property placement</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Upload unlimited images</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Virtual tours & 3D walkthrough</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Advanced analytics & reports</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Direct chat with potential buyers</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Social media promotion</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span>Access to premium leads</span>
              </li>
            </ul>
          </div>

          <button className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
            Upgrade to Premium
          </button>
        </div>
      </div>
    </section>
  );
};

export default page;
