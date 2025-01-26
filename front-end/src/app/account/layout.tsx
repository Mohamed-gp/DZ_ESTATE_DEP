import SideBar from "@/components/accountSideBar/AccountSideBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "user account info",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex relative">
        <SideBar />
        {children}
      </div>
    </>
  );
}
