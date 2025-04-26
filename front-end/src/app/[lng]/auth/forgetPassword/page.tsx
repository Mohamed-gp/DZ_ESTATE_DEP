"use client";
import z from "zod";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import customAxios from "@/utils/customAxios";
import useBoundStore from "@/store/store";

const Page = () => {
  const { user, setUser } = useBoundStore((state) => state);
  const [dataToSubmit, setDataToSubmit] = useState({
    email: "",
    password: "",
    loading: false,
    rememberMe: false,
    // error : ""
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data } = await customAxios.get("/auth/login");
      // setUser(data.user);
      // router.push("/");
      // toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div style={{minHeight : "calc(100vh - 500px)"}} className="container my-12 rounded-xl flex w-full flex-col items-center justify-center bg-white py-12 md:w-[50%]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-6 items-center"
      >
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold sm:text-4xl">
            Reset Your Password
          </h1>
        </div>

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
        <button
          type="submit"
          disabled={dataToSubmit.loading}
          className="m-2 w-full rounded-lg bg-[#0F62FE] p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {dataToSubmit.loading ? "Loading ..." : "Login"}
        </button>

        
        
      </form>
    </div>
  );
};

export default Page;
