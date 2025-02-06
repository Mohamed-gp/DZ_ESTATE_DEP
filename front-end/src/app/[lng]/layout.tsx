import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "@/providers/storeProvider";
import SocketConnectClient from "@/components/socketConnectClient/SocketConnectClient";
import { Suspense } from "react";
import TranslationsProvider from "@/components/TranslationsProvider/TranslationsProvider";
import initTranslations from "../i18n";

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lng: string };
}>) {
  const { lng } = await params;
  const i18Namespace = ["translation"];
  const { t, resources } = await initTranslations(lng, i18Namespace);
  return (
    <html lang={lng} className={lng === "ar" ? "rtl" : ""}>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-[#F2F4F8] antialiased`}
      >
        <TranslationsProvider
          resources={resources}
          locale={lng}
          namespaces={i18Namespace}
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
        </TranslationsProvider>
      </body>
    </html>
  );
}
