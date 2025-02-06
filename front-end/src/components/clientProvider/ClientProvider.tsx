"use client";
import { useEffect, useState, type ReactNode } from "react";

// this client only for test

interface ClientProviderProps {
  children: ReactNode;
}
const ClientProvider = ({ children }: ClientProviderProps) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);
  if (!isRendered) {
  }
  return <>{children}</>;
};
export default ClientProvider;
