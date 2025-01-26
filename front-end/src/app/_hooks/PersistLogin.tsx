'use client'
import { useEffect, useState, ReactNode } from 'react';
import useAuth from '../_hooks/useAuth';
import useRefreshToken from '../_hooks/useRefreshToken';
import { useRouter } from 'next/navigation';

type Props = {
    children: ReactNode;
}

function PersistLogin({ children }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const router = useRouter();
    const { auth, setAuth } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
                if (isMounted) {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Verification failed:", error);
                setAuth(null); // Clear auth state
                localStorage.removeItem('accessToken');
                if (isMounted) {
                    setIsLoading(false);
                }
                router.push('/auth/login');
            }
        };

        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('accessToken');
            
            if (!auth?.accessToken && storedToken) {
                console.log("No auth token in state but found in localStorage, attempting refresh");
                await verifyRefreshToken();
            } else if (!auth?.accessToken && !storedToken) {
                console.log("No tokens found, redirecting to login");
                setIsLoading(false);
                router.push('/auth/login');
            } else {
                console.log("Valid auth token exists");
                setIsLoading(false);
            }
        };

        initializeAuth().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, [refresh, router, auth?.accessToken, setAuth]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    return <>{children}</>;
}

export default PersistLogin;