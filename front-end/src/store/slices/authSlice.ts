import { StateCreator } from "zustand";

export interface AuthSliceInterface {
  user: any;
  setUser: (user: any) => void;
  removeUser: () => void;
}

const createAuthSlice: StateCreator<AuthSliceInterface> = (set) => ({
  user: (() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const storedUser = window.localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  })(),
  setUser: (user: any) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem('user', JSON.stringify(user));
    set(() => ({ user }));
  },
  removeUser: () => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem('user');
    set(() => ({ user: null }));
  },
});

export default createAuthSlice;