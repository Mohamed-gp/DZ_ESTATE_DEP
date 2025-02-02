import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "@/providers/storeProvider";
import SocketConnectClient from "@/components/socketConnectClient/SocketConnectClient";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DZ_Estate",
  description: "1cs project",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-[#F2F4F8] antialiased`}
      >
        <StoreProvider>
          <SocketConnectClient />
          <Toaster />
          <Suspense
            fallback={
              <div className="flex h-16 items-center justify-center bg-white shadow-md">
                <div className="loader h-8 w-8 rounded-full border-4 border-t-4 border-gray-200 ease-linear"></div>
              </div>
            }
          >
            <Header />
          </Suspense>
          {children}
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
