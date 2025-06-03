"use client";
import { useState } from "react";
import { X, CreditCard, AlertCircle } from "lucide-react";
import customAxios from "@/utils/customAxios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Define proper interfaces
interface Asset {
  id: string;
  url: string;
  type: "image" | "video";
}

interface User {
  id: string;
  username: string;
  profile_image: string;
  phone_number: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "rent" | "sale" | "sell";
  guests: number;
  bedrooms: number;
  bathrooms: number;
  owner_id: string;
  owner: User;
  assets: Asset[];
  latitude?: number;
  longitude?: number;
}

interface DateSelection {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface PaymentModalProps {
  property: Property;
  state: DateSelection[];
  daysCount: number;
  setIsPaymentModelOpen: (value: boolean) => void;
}

const PaymentModal = ({
  state,
  property,
  daysCount,
  setIsPaymentModelOpen,
}: PaymentModalProps) => {
  const [selectedPayment, setSelectedPayment] = useState<string>("stripe");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reserveHandler = async () => {
    try {
      setIsLoading(true);

      const { data } = await customAxios.post(`/reservations`, {
        property_id: property?.id,
        start_date: new Date(state[0]?.startDate).toISOString().slice(0, 10),
        end_date: new Date(state[0]?.endDate).toISOString().slice(0, 10),
        payment_method: selectedPayment,
      });

      toast.success(data.message);
      window.open(data.url, "_blank");
      setIsPaymentModelOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Payment processing failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsPaymentModelOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mt-6">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
            Choose Your Payment Method
          </h2>

          {/* Payment Summary */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              Reservation Summary
            </h3>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">Property:</span>
              <span className="font-medium">{property?.title}</span>
            </div>
            {property.status === "rent" && (
              <>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {new Date(state[0]?.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {new Date(state[0]?.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{daysCount} days</span>
                </div>
              </>
            )}
            <div className="mt-2 flex justify-between border-t border-blue-100 pt-2 font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-700">
                $
                {property.status === "rent"
                  ? (property.price * daysCount).toLocaleString()
                  : property.price.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Stripe Option */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => setSelectedPayment("stripe")}
                className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                  selectedPayment === "stripe"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                }`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAllBMVEVjWv////9hWP////2urPtRRv9bUf9ZT/9fVf9aUP/Oy/ddVP9gV//t7fj19f3PzvtVSv1pYfiOh/htZfhqYfyHgvjU0fd1b/mSjPlUSf75+vzIx/jp5/lwafns6vizsPulofm7uPje3PmgnPri4vnAvviZlPl/ePZkXP2Jgve4tPnDw/m7ufl9dfnY1vmmpPdMQf5DNfjCy6IFAAAD0UlEQVR4nO3Y63aiOgCGYQgacMA2KIpoLU4totjq9P5vbpOEeuhhd/banSXjep8fiCm0+ZojOM7aAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPC3EJeuwJ8kAqn8+NK1+INEsvr54O3kpevxXaLQj85L/LFb++Ffpj7fzVfpcjYKzsturyihba7JeSPahOPrSKj6nut6kzdtOPYei9Xwr55MA9nryVDohLq5BjKIhBMEUVAfw9AZ+pmSkSOimtAXy+j8ZnNvi0k5qYqiWs0zYRMuynKUrEdlWQ5VuV9GaX02SoP5ZjQarLOy2lYj9Zox7E2q7dMqaPNMqyrPtfpJ1m9O3UGsj0VRd1rHDM5xN9fXLR7M1Xfz0NycLabmu9dRF47xObVzD+bHhCOTcKoPws6l3Y7N4tqPZz1Ys9mhYJZdOsknZOcY0B0eE27i1zPvkNA9Na2HpF+dFOxb2lHVjY1hWuLjhM55wtc+XfTE0Kvvc6e7G/ufaOV0IxJT4b2Sw9Wt1/TSzmgzSIY2zi5/Cs56aZHGNqrX87f680GprhmpnVY2okhNtQdKOJGfNDONXi0im3CVSemfJrz7JYTam59NuuZjrdcRz0S9dJqPCGHbY/uswvpLsx7Wk4iwCWNx2LXZXnqnYygzA1Vzfey/+L7/cq9/STt3PXYqrZvgJo8C513C4YcJ/R/6dDZxz61bOhCnhyllI/89oe6K9zph70mX3C7fJJy3MqETrcevs6NXdn8z4c8PE6btTOgINS/skuE+vtiE0TGh86aXmoT2EWRre+nNq2nczoT1pllINbEZs99rw8z07Dw1Df+SqUY7AwaVo+qQsjSBEpNw6Yso+KANTcJfUZTZBXHTNd17kdXJRCRbuVbUlOfdLudibRZvt2cS3oySwfyTudSdlandqtcrvplS3TzJlHjOp0k729AubWb3pde2wza82bW9G4dHRS9KmznK7vnauVg4/vSk0kt/1VS5ebZ4Pw4PpvV05OenJW1NeFLtrXKyXZNw80VCr9RPT+qp/QnD/N50Mc/tr+q5QvgzE9At7TjUi7jfPAHbmaYw5Y/NE7DaPNq73ftF8MWfupRQJZN9lS/TzNZQxYuqs0pCZxjHsR6G9banPosTaRO+xIt8kR5Whkglq06+nyQqvFSCr4lAShkeXi6JUJo3S0KzJUaTUNU/D0/fRJnrg3b20P9GHlf8KyWPzxZXyibsX3PC3Hssli19QvoWIpGq1/KX2//TVYcDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArsY/dqQ5wPYTIAEAAAAASUVORK5CYII="
                    alt="Stripe logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-500">For worldwide users</p>
                </div>
              </div>
              {selectedPayment === "stripe" && (
                <div className="mt-2 text-sm font-medium text-blue-600">
                  Selected
                </div>
              )}
            </div>

            {/* Chargily Option */}
            <div className="flex flex-col items-center">
              <div className="flex w-full cursor-not-allowed flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 p-4 opacity-70">
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <img
                    src="https://lh3.googleusercontent.com/p/AF1QipMzO3gC3u2yUzaFOTFMFyXnf3mHfdnauwOGbYkL=s680-w680-h510"
                    alt="Chargily logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Chargily</p>
                  <p className="text-sm text-gray-500">For Algerian users</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">Coming soon...</div>
            </div>
          </div>

          {/* Warning note */}
          <div className="mb-6 flex items-start rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-yellow-500" />
            <p>
              You will be redirected to our payment provider to complete your
              transaction securely. No payment information is stored on our
              servers.
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={reserveHandler}
            disabled={daysCount === 0 || isLoading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <CreditCard className="mr-2 h-5 w-5 animate-pulse" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Complete Reservation
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
