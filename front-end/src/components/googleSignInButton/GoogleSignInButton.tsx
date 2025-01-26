import Image from "next/image";
import toast from "react";

const GoogleSignIn = () => {
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
      dispatch(authActions.login(data.data));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <button
      type="button"
      onClick={() => handleGoogleSignIn()}
      className="text-mainColor my-2 flex w-full justify-center gap-2 border-2 border-[#0F62FE] py-2 text-[#0F62FE]"
    >
      <Image src="/googleLogo.svg" alt="google" width={20} height={20} />
      <p className="text-primaryColor">Continue With Google</p>
    </button>
  );
};
export default GoogleSignIn;
