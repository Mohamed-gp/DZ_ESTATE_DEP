import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <div
      className="container flex flex-col items-center justify-center text-center text-xl"
      style={{ height: "calc(100vh - 70px)" }}
    >
      {/* <div className="">
        <Image
          alt="Mountains"
          src="/not-found-page.png"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "300px", height: "auto" }}
        />
      </div> */}
      <p className="mb-4 mt-4 text-2xl font-bold">Oops! Page not found</p>
      <p className="mb-2">
        The page you are looking for might have been removed or temporarily
        unavailable.
      </p>
      <Link
        href="/"
        className="mt-3 rounded-xl bg-blueColor px-5 py-2 text-white"
      >
        Back to HomePage
      </Link>
    </div>
  );
};
export default NotFound;
