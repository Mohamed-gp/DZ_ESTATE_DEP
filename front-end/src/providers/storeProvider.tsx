"use client";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { StoreApi } from "zustand";
import useBoundStore, { RootState } from "@/store/store";

export type StoreApiType = StoreApi<RootState>;

export const StoreContext = createContext<StoreApiType | undefined>(undefined);

export interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<StoreApiType>();

  if (!storeRef.current) {
    storeRef.current = useBoundStore;
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};
