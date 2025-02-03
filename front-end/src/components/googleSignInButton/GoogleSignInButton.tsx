"use client";
import { FaGoogle } from "react-icons/fa";
import { app } from "@/utils/fireBase";
import useBoundStore from "../../store/store";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import customAxios from "@/utils/customAxios";
import { useRouter } from "next/navigation";

const GoogleSignIn = () => {
  const { setUser } = useBoundStore();
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, photoURL } = result.user;
      const { data } = await customAxios.post("/auth/google", {
        username: displayName,
        email,
        photoUrl: photoURL,
      });

      toast.success(data.message);
      setUser(data.data);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="order-5 flex h-full w-[100%] flex-grow-0 flex-row items-center justify-center self-stretch rounded-lg border-2 border-[#0F62FE] px-4 py-2 text-base text-[#0F62FE]"
    >
      <FaGoogle />
      log in with Google
    </button>
  );
};
export default GoogleSignIn;
