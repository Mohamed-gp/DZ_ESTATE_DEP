"use client";
import customAxios from "@/utils/customAxios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Bell, Loader2 } from "lucide-react";

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      setIsSubmitting(true);
      const { data } = await customAxios.post("/subscribers", { email });
      toast.success(data.message);
      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-10 text-white">
        <h2 className="text-2xl font-bold tracking-tight">
          Subscribe to Our Newsletter
        </h2>
        <p className="mt-2 text-indigo-100">
          Get the latest news and updates on new properties
        </p>
      </div>

      <div className="p-6">
        {isSubscribed ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Thanks for subscribing!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You'll now receive updates on our latest properties and special
              offers.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                By subscribing, you agree to our{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Privacy Policy
                </a>{" "}
                and consent to receive updates from our company.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6 flex items-center">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="mx-4 text-sm font-medium text-gray-500">
            Or follow us
          </span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((social) => (
            <a
              key={social}
              href="#"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
            >
              {social.charAt(0)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
