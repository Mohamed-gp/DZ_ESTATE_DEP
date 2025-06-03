"use client";
import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

const ContactUs: React.FC = () => {
  return (
    <div className="h-full overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white">
        <h2 className="text-2xl font-bold tracking-tight">Get in Touch</h2>
        <p className="mt-2 text-blue-100">
          We&apos;re here to help with any questions about our properties
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Email Us</h3>
              <p className="mt-1 text-gray-600">
                Our friendly team is here to help
              </p>
              <a
                href="mailto:mohamedterba6@gmail.com"
                target="_blank"
                className="mt-2 inline-block text-blue-600 transition-colors hover:text-blue-700"
              >
                mohamedterba6@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Phone className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Call Us</h3>
              <p className="mt-1 text-gray-600">Mon-Fri from 8am to 5pm</p>
              <a
                href="tel:+123456789"
                className="mt-2 inline-block text-blue-600 transition-colors hover:text-blue-700"
              >
                +123 456 789
              </a>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Visit Us</h3>
              <p className="mt-1 text-gray-600">Come say hello at our office</p>
              <p className="mt-2 text-gray-800">
                Usa street, 123, City, Country
              </p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default ContactUs;
