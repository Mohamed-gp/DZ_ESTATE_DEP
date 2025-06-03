import { StateCreator } from "zustand";
import { user } from "../../../types";

export interface AuthSliceInterface {
  user: user | null;
  setUser: (user: user | null) => void;
  removeUser: () => void;
}

const createAuthSlice: StateCreator<AuthSliceInterface> = (set) => ({
  user: (() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    try {
      const storedUser = window.localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined" || storedUser === "null") {
        return null;
      }
      const parsedUser = JSON.parse(storedUser) as user;
      return parsedUser;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      // Clear invalid data from localStorage
      window.localStorage.removeItem("user");
      return null;
    }
  })(),
  setUser: (user: user | null) => {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    if (user) {
      window.localStorage.setItem("user", JSON.stringify(user));
    }
    set(() => ({ user }));
  },
  removeUser: () => {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem("user");
    set(() => ({ user: null }));
  },
});

export default createAuthSlice;
