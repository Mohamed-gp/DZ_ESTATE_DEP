'use client'
import { useContext} from 'react';
import { AuthContext } from '../../../context/AuthContext';


export const useAuth = () => {
const authContext = useContext(AuthContext);
const auth = authContext?.auth;
const context =  useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used in an AuthProvider');
  }


return useContext(AuthContext);
};

export default useAuth;