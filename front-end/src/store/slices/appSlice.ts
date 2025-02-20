import { StateCreator } from "zustand";

export interface AppSliceInterface {
  currency: "USD" | "EUR" | "DZD";
  language: "EN" | "FR" | "AR";
  theme: "light" | "dark";
  changeCurrency: (currency: string) => void;
  changeLanguage: (language: string) => void;
}

const createAppSlice: StateCreator<AppSliceInterface> = (set) => ({
  currency: ((): "USD" | "EUR" | "DZD" => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return "USD";
    }
    const storedCurrency = localStorage.getItem("currency");
    if (storedCurrency === "USD" || storedCurrency === "EUR" || storedCurrency === "DZD") {
      return storedCurrency;
    }
    return "USD";
  })(),
  language: ((): "EN" | "FR" | "AR" => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return "EN";
    }
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage === "EN" || storedLanguage === "FR" || storedLanguage === "AR") {
      return storedLanguage;
    }
    return "EN";
  })(),
  theme: "light",
  changeCurrency: (currency: string) => {
    if (currency !== "USD" && currency !== "EUR" && currency !== "DZD") {
      throw new Error("Invalid currency");
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("currency", currency);
      }
      set({ currency });
    }
  },
  changeLanguage: (language: string) => {
    if (language !== "AR" && language !== "FR" && language !== "EN") {
      throw new Error("Invalid language");
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("language", language);
      }
      set({ language });
    }
  },
});

export default createAppSlice;