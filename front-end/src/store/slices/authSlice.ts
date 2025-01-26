import { StateCreator } from "zustand";

export interface AuthSliceInterface {
    user: any;
    setUser: (user: any) => void;
    removeUser: () => void;
}


const createAuthSlice:StateCreator<AuthSliceInterface> = (set) => ({
    user : (() => {
        if (!localStorage) {
            return null;
        }
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    })(),
    setUser: (user: string) => {
        if(!localStorage){
            return null;
        }
            localStorage.setItem('user', JSON.stringify(user));
        set(() => ({ user }));
    },
    removeUser: () => {

        localStorage.removeItem('user');
        set(() => ({ user: null }));
    }
})

export default createAuthSlice;


