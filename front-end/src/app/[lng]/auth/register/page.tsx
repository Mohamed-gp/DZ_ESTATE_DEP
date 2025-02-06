"use client";
import z from "zod";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";
import GoogleSignIn from "@/components/googleSignInButton/GoogleSignInButton";

const Page = () => {
  const { user, setUser } = useBoundStore((state) => state);
  const [dataToSubmit, setDataToSubmit] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    loading: false,
    rememberMe: false,
    // error : null
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!isValidPhoneNumber(dataToSubmit.phoneNumber)) {
        toast.error("Invalid Phone Number");
        return;
      }
      const { data } = await customAxios.post("/auth/register", dataToSubmit);
      setUser(data.data.user);
      router.push("/");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber) && !isNaN(Number(phoneNumber));
  };

  return (
    <div className="container my-12 flex w-full flex-col items-center justify-center bg-white py-12 md:w-[50%]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center"
      >
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold sm:text-4xl">Sign Up</h1>
        </div>

        <input
          id="username"
          type="text"
          placeholder="Username"
          className="m-2 w-full bg-[#F2F4F8] p-2"
          onChange={(e) =>
            setDataToSubmit({ ...dataToSubmit, username: e.target.value })
          }
          value={dataToSubmit.username}
        />
        <input
          id="phoneNumber"
          type="text"
          placeholder="PhoneNumber"
          className="m-2 w-full bg-[#F2F4F8] p-2"
          onChange={(e) =>
            setDataToSubmit({ ...dataToSubmit, phoneNumber: e.target.value })
          }
          value={dataToSubmit.phoneNumber}
        />
        <input
          id="email"
          type="text"
          placeholder="Email"
          className="m-2 w-full bg-[#F2F4F8] p-2"
          onChange={(e) =>
            setDataToSubmit({ ...dataToSubmit, email: e.target.value })
          }
          value={dataToSubmit.email}
        />
        <input
          type="password"
          placeholder="Password"
          className="m-2 w-full bg-[#F2F4F8] p-2"
          onChange={(e) =>
            setDataToSubmit({ ...dataToSubmit, password: e.target.value })
          }
          value={dataToSubmit.password}
        />
        <button
          type="submit"
          disabled={dataToSubmit.loading}
          className="m-2 w-full rounded-lg bg-[#0F62FE] p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {dataToSubmit.loading ? "Loading ..." : "Login"}
        </button>

        <div className="my-2 flex w-full justify-between">
          <div>
            <input
              type="checkbox"
              name="rememberme"
              className="mx-4"
              id="Rememberme"
            />
            <label htmlFor="Rememberme">Remember me</label>
          </div>
          <Link href="/auth/forgetPassword" className="text-[#001D6C]">
            Forget Password
          </Link>
        </div>

        <div className="my-4 flex w-full flex-col items-center justify-center border-y">
          <p className="m-2 text-base">Or log in with :</p>
          <GoogleSignIn />
        </div>

        <Link href="/auth/login" className="text-[#001D6C]">
          Already Have An Account ? <span className="font-bold">Login</span>
        </Link>
      </form>
    </div>
  );
};

export default Page;
