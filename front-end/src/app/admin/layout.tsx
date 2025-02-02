import AdminSideBar from "@/components/accountSideBar/AdminSideBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "admin account info",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="relative flex">
        <AdminSideBar />
        {children}
      </div>
    </>
  );
}
