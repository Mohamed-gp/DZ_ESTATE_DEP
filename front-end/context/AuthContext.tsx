'use client'
import { createContext , useState, ReactNode } from "react";



export type Auth = {
  user?: user;
  accessToken?: string;
};

export type AuthContextType = {
  auth: Auth | null;
  setAuth: React.Dispatch<React.SetStateAction<Auth | null>>;
};

// Create the context with proper typing and default values
export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => null,
});

type AuthContextProps ={
  children: ReactNode;
}


export const AuthProvider = ({ children }:AuthContextProps) => {

  const [auth, setAuth] = useState<Auth | null>(null);
  
  return <AuthContext.Provider value={{auth , setAuth}}>
      {children}
    </AuthContext.Provider>;
  
}

export default AuthProvider;