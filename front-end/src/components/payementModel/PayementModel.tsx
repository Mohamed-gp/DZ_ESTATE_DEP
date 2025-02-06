"use client";
import customAxios from "@/utils/customAxios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaX } from "react-icons/fa6";

interface PayementModelProps {
  property: any;
  state: any;
  daysCount: number;
  setIsPaymentModelOpen: (value: boolean) => void;
}

const PayementModel = ({
  state,
  property,
  daysCount,
  setIsPaymentModelOpen,
}: PayementModelProps) => {
  const [selectedPayement, setSelectedPayement] = useState<string>("stripe");
  const reserveHandler = async () => {
    try {
      console.log({
        property_id: property?.id,
        start_date: new Date(state[0]?.startDate).toISOString().slice(0, 10),
        end_date: new Date(state[0]?.endDate).toISOString().slice(0, 10),
        payment_method: selectedPayement,
      });
      const { data } = await customAxios.post(`/reservations`, {
        property_id: property?.id,
        start_date: new Date(state[0]?.startDate).toISOString().slice(0, 10),
        end_date: new Date(state[0]?.endDate).toISOString().slice(0, 10),
        payment_method: selectedPayement,
      });
      toast.success(data.message);
      window.open(data.url, "_blank");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div
      className="fixed left-0 top-0 z-[1000] h-screen w-screen"
      onClick={() => setIsPaymentModelOpen(false)}
    >
      <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        onClick={(e) => e.stopPropagation()}
        className="container fixed left-[25vw] top-[15vh] z-[61] mt-6 flex h-[70vh] w-[50vw] flex-col overflow-auto rounded-2xl bg-white p-6"
      >
        <FaX
          onClick={() => setIsPaymentModelOpen(false)}
          className="text-redColor absolute right-6 top-6 cursor-pointer"
        />
        <div className="mt-12 flex h-full flex-col items-center justify-center">
          <p className="font-bold">Chose Your payement method</p>
          <div className="my-12 flex flex-1 items-center justify-center gap-x-12">
            <div
              onClick={() => setSelectedPayement("stripe")}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div
                style={
                  selectedPayement == "stripe"
                    ? { border: "2px solid #4561EC" }
                    : {}
                }
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-12"
              >
                <div className="img w-20 overflow-hidden rounded-full">
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAllBMVEVjWv////9hWP////2urPtRRv9bUf9ZT/9fVf9aUP/Oy/ddVP9gV//t7fj19f3PzvtVSv1pYfiOh/htZfhqYfyHgvjU0fd1b/mSjPlUSf75+vzIx/jp5/lwafns6vizsPulofm7uPje3PmgnPri4vnAvviZlPl/ePZkXP2Jgve4tPnDw/m7ufl9dfnY1vmmpPdMQf5DNfjCy6IFAAAD0UlEQVR4nO3Y63aiOgCGYQgacMA2KIpoLU4totjq9P5vbpOEeuhhd/banSXjep8fiCm0+ZojOM7aAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPC3EJeuwJ8kAqn8+NK1+INEsvr54O3kpevxXaLQj85L/LFb++Ffpj7fzVfpcjYKzsturyihba7JeSPahOPrSKj6nut6kzdtOPYei9Xwr55MA9nryVDohLq5BjKIhBMEUVAfw9AZ+pmSkSOimtAXy+j8ZnNvi0k5qYqiWs0zYRMuynKUrEdlWQ5VuV9GaX02SoP5ZjQarLOy2lYj9Zox7E2q7dMqaPNMqyrPtfpJ1m9O3UGsj0VRd1rHDM5xN9fXLR7M1Xfz0NycLabmu9dRF47xObVzD+bHhCOTcKoPws6l3Y7N4tqPZz1Ys9mhYJZdOsknZOcY0B0eE27i1zPvkNA9Na2HpF+dFOxb2lHVjY1hWuLjhM55wtc+XfTE0Kvvc6e7G/ufaOV0IxJT4b2Sw9Wt1/TSzmgzSIY2zi5/Cs56aZHGNqrX87f680GprhmpnVY2okhNtQdKOJGfNDONXi0im3CVSemfJrz7JYTam59NuuZjrdcRz0S9dJqPCGHbY/uswvpLsx7Wk4iwCWNx2LXZXnqnYygzA1Vzfey/+L7/cq9/STt3PXYqrZvgJo8C513C4YcJ/R/6dDZxz61bOhCnhyllI/89oe6K9zph70mX3C7fJJy3MqETrcevs6NXdn8z4c8PE6btTOgINS/skuE+vtiE0TGh86aXmoT2EWRre+nNq2nczoT1pllINbEZs99rw8z07Dw1Df+SqUY7AwaVo+qQsjSBEpNw6Yso+KANTcJfUZTZBXHTNd17kdXJRCRbuVbUlOfdLudibRZvt2cS3oySwfyTudSdlandqtcrvplS3TzJlHjOp0k729AubWb3pde2wza82bW9G4dHRS9KmznK7vnauVg4/vSk0kt/1VS5ebZ4Pw4PpvV05OenJW1NeFLtrXKyXZNw80VCr9RPT+qp/QnD/N50Mc/tr+q5QvgzE9At7TjUi7jfPAHbmaYw5Y/NE7DaPNq73ftF8MWfupRQJZN9lS/TzNZQxYuqs0pCZxjHsR6G9banPosTaRO+xIt8kR5Whkglq06+nyQqvFSCr4lAShkeXi6JUJo3S0KzJUaTUNU/D0/fRJnrg3b20P9GHlf8KyWPzxZXyibsX3PC3Hssli19QvoWIpGq1/KX2//TVYcDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArsY/dqQ5wPYTIAEAAAAASUVORK5CYII="
                    alt=""
                  />
                </div>
                <p className="font-bold">Stripe</p>
                <p>WorldWide Users</p>
              </div>
              {selectedPayement == "stripe" && (
                <p className="font-bold">selected</p>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                style={
                  selectedPayement == "chargily"
                    ? { border: "2px solid #4561EC" }
                    : {}
                }
                // onClick={() => setSelectedPayement("chargily")}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-12"
              >
                <div className="img w-20 overflow-hidden rounded-full">
                  <img
                    src="https://lh3.googleusercontent.com/p/AF1QipMzO3gC3u2yUzaFOTFMFyXnf3mHfdnauwOGbYkL=s680-w680-h510"
                    alt=""
                  />
                </div>
                <p className="font-bold">Chargily</p>
                <p>Algerian users</p>
              </div>
              {selectedPayement == "chargily" && (
                <p className="font-bold">selected</p>
              )}
              <p className="">Soon...</p>
            </div>
          </div>
          <button
            onClick={() => reserveHandler()}
            // onClick={() => setIsPaymentModelOpen(true)}
            disabled={daysCount == 0}
            className="mx-auto my-2 flex w-full cursor-pointer items-end justify-center gap-2 rounded-xl bg-[#3d91ff] px-6 py-1 text-white duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};
export default PayementModel;
