'use client'
import useAuth from './useAuth'

const useRefreshToken = () => {
    const {  setAuth } = useAuth()
    
    const refresh = async () => {
        try {
            console.log('Attempting to refresh token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refreshtoken`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Refresh failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Refresh response data:", data);

            if (data?.accessToken) {
                setAuth(prev => ({
                    ...prev,
                    ...data,
                    accessToken: data.accessToken
                }));
                localStorage.setItem('accessToken', data.accessToken);
                return data.accessToken;
            } else {
                throw new Error('No access token in refresh response');
            }
        } catch (error) {
            console.error("Refresh token error:", error);
            localStorage.removeItem('accessToken');
            throw error; // Re-throw to be handled by PersistLogin
        }
    };
    
    return refresh;
};

export default useRefreshToken;